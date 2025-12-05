import {
  CacheCurrentChat,
  redisClient,
} from "../CachingHandler/redisClient.js";
import {
  genAI,
  SynthesisResponseGenerator,
} from "../controllers/ModelController.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";

import { IDENTIFIER_PROMPT } from "../Prompts/Prompts.js";
import { ToolRegistry } from "./tools.js";
import {
  currentTime,
  StoreQueryAndResponse,
} from "../controllers/fileControllers.js";
import { ProcessUserQuery } from "../controllers/UserCreditLimitController.js";
import { getIo } from "../websocketsHandler.js/socketIoInitiater.js";
import { supabase } from "../controllers/supabaseHandler.js";

//function to identify the functions needed to process the request

export async function IdentifyRequestInputs(req, res) {
  const user = req.user;
  if (!user) {
    return res.status(401).send({ message: "Please log in to continue" });
  }

  const { question, MessageId, userMessageId, selectedDocuments } = req.body;

  if (
    !question ||
    typeof question !== "string" ||
    !MessageId ||
    typeof MessageId !== "string" ||
    !userMessageId ||
    typeof userMessageId !== "string" ||
    !selectedDocuments
  ) {
    return res
      .status(400)
      .send({ message: "Invalid data has been sent to the server" });
  }

  try {
    let FinalString = `${IDENTIFIER_PROMPT}_This is the users question=${question}`; //command for the model

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: FinalString }] }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 20,
        maxOutputTokens: 200, ///maximum 300 characters output
      },
    });

    const responseText = result.text;
    // const responseText = `ask_private(doc_id="4ae39375-8a4e-4a09-90cb-db2111bd2e7d", query="synthesize for detailed analysis"); GetDoc_info(doc_id="4ae39375-8a4e-4a09-90cb-db2111bd2e7d")`;
    //  search_knowledge(query="AUTO", category= "AUTO", subCategory= "AUTO")
    // const responseText = `ask_private(doc_id="AUTO", query="synthesize document information"); GetDoc_info(doc_id="AUTO")`;

    if (!responseText) {
      await notifyMe(
        `Error while generating a response , the code execution results are these`
        // JSON.stringify(result.codeExecutionResult)
      );
      return { error: "The server is very busy , please try again !" };
    }

    const io = getIo();
    if (io) {
      io.to(user.user_id).emit("SynthesisStatus", "Dissecting Request");
    }
    const ExtractedFunctions = CentralFunctionProcessor(responseText, io); //clearing the function string
    // console.log(ExtractedFunctions);

    if (ExtractedFunctions.length < 0) {
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }

    if (io) {
      io.to(user.user_id).emit("SynthesisStatus", "Finding sources");
    }
    const message = {
      id: userMessageId, //users message Id
      sent_by: "You", //sent by the user
      message: { isComplete: true, content: question },
      sent_at: currentTime,
    };
    await CacheCurrentChat(message, req.user);

    const smartExecResult = await ExeCuteContextEngines(
      ExtractedFunctions,
      user,
      selectedDocuments,
      io
    );

    if (!smartExecResult || smartExecResult.message) {
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }
    const ModelResponse = await SynthesisResponseGenerator(
      smartExecResult,
      question,
      user
    );

    if (ModelResponse.error) {
      return res
        .status(400)
        .send({ message: "Error while processing your request" });
    }
    const AiMessage = {
      id: MessageId,
      sent_by: "Eureka", //sent by the user
      message: {
        isComplete: true,
        content: ModelResponse,
      },
      sent_at: currentTime,
    };
    // update the cache
    await CacheCurrentChat(AiMessage, req.user);

    const UpdateState = await ProcessUserQuery(req.user);

    // storing the convo in solid state db
    const StoreChats = await StoreQueryAndResponse(
      user.user_id,
      question,
      smartExecResult
    );
    if (StoreChats.error) {
      await notifyMe(
        `Error while storing response history ${StoreChats.error}`
      );
    }

    return res.status(200).send({
      message: "Response generated",
      Answer: ModelResponse,
      // favicon: { MessageId, icon: [] },
    });
  } catch (SynthesisError) {
    await notifyMe("An error occured in the synthesis hanlder", SynthesisError);
    return res
      .status(500)
      .send({ message: "The server failed to generate a response" });
  }
}

//central funciton that will process the request based on the functionname
function CentralFunctionProcessor(resultString) {
  if (!resultString || typeof resultString !== "string") {
    return {
      message:
        "Invalid arguments all the information is needed to process the request",
    };
  }

  //filterting the response string of the model and extracting function names and parameters from it
  const FilteredFunc = [];

  // 1. Split by semicolon
  const rawFunctions = resultString.split(";");

  rawFunctions.forEach((element) => {
    const cleanStr = element.trim();
    if (!cleanStr) {
      return { message: "function information is invalid" };
    }
    const mainRegex = /^(\w+)\s*\((.*)\)$/;
    const match = cleanStr.match(mainRegex);
    if (match) {
      const funcName = match[1]; //the function name
      const argsString = match[2]; //the arguments
      //clearning the arguments string
      const args = [];
      const argRegex = /(\w+)="([^"]*)"/g;
      let argsMatch;

      //while there are not null values in the string
      while ((argsMatch = argRegex.exec(argsString)) !== null) {
        const key = argsMatch[1];
        const value = argsMatch[2];
        args[key] = value; //adding the vlue in the array as object pair
      }
      if (funcName && args) {
        FilteredFunc.push({
          function_name: funcName,
          arguments: args,
        });
      }
    }
  });

  return FilteredFunc;
}

//call the functions and execute them based on their priority list from the ToolRegistry
async function ExeCuteContextEngines(
  functionsArray,
  user,
  selectedDocuments,
  io
) {
  try {
    if (!functionsArray.length < 0) {
      return { message: "No functions found in the array" };
    }

    //distributing requirement in two phases
    let phase1_Context = [];
    let phase2_Action = [];

    //distributing the context and action
    functionsArray.forEach((func) => {
      const config = ToolRegistry[func.function_name];
      if (!config) return; // Skip unknown functions

      if (config.importance === 1) {
        phase1_Context.push({ ...func, config });
      } else {
        phase2_Action.push({ ...func, config });
      }
    });

    if (io) {
      io.to(user.user_id).emit("SynthesisStatus", "Distributing resources");
    }
    let GlobalContextObject = {
      AlldocumentInformation: [],
      privateFilesResponse: [],
      knowledgebaseData: [],
      webSearchResults: [],
      oldMemories: [],
      pastConversation: [],
    }; //will contain the all the context information source and actual context

    // step 1 exectuing the phase 1 context gathering
    if (phase1_Context.length > 0) {
      //filter method to catch number of document info we require
      const needs_doc_info = phase1_Context.filter(
        (li) => li.function_name === "GetDoc_info"
      );
      const docToolConfig = ToolRegistry["GetDoc_info"];

      if (needs_doc_info.length > 0 || selectedDocuments.length > 0) {
        const uniqueDocsMap = new Map(); //map to store only unique values

        for (const item of needs_doc_info) {
          const docId = item.arguments.doc_id; //from arguments only pick those who have a uuid
          const cleanId = extractUUID(docId); //clean the docuement_ID
          if (cleanId) {
            uniqueDocsMap.set(cleanId, item);
          }
        }

        //extract document_ids from the manually selected document_id's
        for (const docId of selectedDocuments) {
          if (!uniqueDocsMap.has(docId)) {
            uniqueDocsMap.set(docId, {
              function_name: "GetDoc_info",
              arguments: { doc_id: docId, query: "AUTO" },
              config: docToolConfig,
            });
          }
        }

        // --- 4. Finalize and Process ---
        const FinalizedDocuments = Array.from(uniqueDocsMap.values());

        const docdata = await ProcessDocumentInfoGathering(
          FinalizedDocuments,
          user
        );

        // --- 5. Update Global Context ---
        if (docdata.length !== 0) {
          if (io) {
            io.to(user.user_id).emit(
              "SynthesisStatus",
              "Gathered DocumentInformation"
            );
          }

          GlobalContextObject.AlldocumentInformation = [...docdata];
        }
      }

      const needs_to_search_knowledgebase = phase1_Context.filter(
        (li) => li.function_name === "search_knowledge"
      );

      //if there are
      const PublicKnowledge = await ProcessKnowledgeBaseContextGathering(
        needs_to_search_knowledgebase,
        user,
        GlobalContextObject.AlldocumentInformation
      );

      if (PublicKnowledge) {
        if (io) {
          io.to(user.user_id).emit(
            "SynthesisStatus",
            "Reading public knowledgebase"
          );
        }

        GlobalContextObject.knowledgebaseData = [...PublicKnowledge];
      }

      if (phase2_Action.length > 0) {
        const needs_web_results = phase2_Action.filter(
          (li) => li.function_name === "search_web"
        );

        if (needs_web_results.length > 0) {
          const webResult = await ProcessWebContextGathering(
            needs_web_results,
            user,
            GlobalContextObject.AlldocumentInformation
          );
          if (webResult.length > 0) {
            // console.log("This is the finformation from the web", webResult);
            if (io) {
              io.to(user.user_id).emit("SynthesisStatus", "Searching Web ");
            }
            GlobalContextObject.webSearchResults = [...webResult];
          }
        }

        //if private documents are needed to be scanned
        const askPrivateRequests = phase2_Action.filter(
          (li) => li.function_name === "ask_private"
        );

        // We need the config to execute later
        const privateToolConfig = ToolRegistry["ask_private"];

        // Map to handle deduplication: Key = doc_id
        const privateDocsMap = new Map();

        // Variable to store the "General Query" if the LLM uses AUTO
        let fallbackQuery =
          "Extract relevant information based on user request";

        // ---------------------------------------------------------
        // STEP 1: Process LLM Requests
        // ---------------------------------------------------------
        askPrivateRequests.forEach((req) => {
          const rawId = req.arguments.doc_id;
          const rawQuery = req.arguments.query;
          const cleanId = extractUUID(rawId); // Use your helper

          // CASE A: Valid, Specific UUID
          if (cleanId) {
            privateDocsMap.set(cleanId, {
              arguments: { doc_id: cleanId, query: rawQuery || fallbackQuery }, //in the same format we extract from the function
              config: privateToolConfig,
            });
          }
          // CASE B: "AUTO" (Capture the query to use on selected docs)
          else if (rawId === "AUTO" || !rawId) {
            if (rawQuery && rawQuery.trim() !== "") {
              fallbackQuery = rawQuery; // "Summarize this", "Find risks", etc.
            }
          }
        });

        // ---------------------------------------------------------
        // STEP 2: Process Selected Documents (The "Podium")
        // We use 'GlobalContextObject.AlldocumentInformation' because
        // Phase 1 has already validated that these docs exist.
        // ---------------------------------------------------------
        const validDocsFromPhase1 =
          GlobalContextObject.AlldocumentInformation || [];

        //if there are valid docs
        if (validDocsFromPhase1.length > 0) {
          validDocsFromPhase1.forEach((docObj) => {
            const docId = docObj.doc_id || docObj.id;

            if (docId && !privateDocsMap.has(docId)) {
              privateDocsMap.set(docId, {
                arguments: { doc_id: docId, query: fallbackQuery },
                config: privateToolConfig,
              });
            }
          });
        }

        const CleanedRequest = Array.from(privateDocsMap.values()); //make an array of it

        if (CleanedRequest.length > 0) {
          if (io) {
            io.to(user.user_id).emit(
              "SynthesisStatus",
              "Reading Private Documents..."
            );
          }

          // Now we pass the cleaner array to your helper
          // Note: You might need to adjust CheckPrivateDocs to accept this array structure
          const PrivateInfo = await CheckPrivateDocs(
            CleanedRequest,
            user,
            GlobalContextObject.AlldocumentInformation
          );

          if (PrivateInfo) {
            GlobalContextObject.privateFilesResponse = [...PrivateInfo];
          }
        }

        //if older memories are required
        const needs_memory = phase2_Action.filter((li) => {
          li.function_name === "get_memory";
        });

        if (needs_memory.length > 0) {
          const memories = await RetrieveMemories(user, needs_memory);
        }

        const needs_to_store_memory = phase2_Action.filter(
          (li) => li.function_name === "store_memory"
        );

        if (needs_to_store_memory.length > 0) {
          const storedMemories = await HandleMemoryStorage(
            user,
            needs_to_store_memory
          );

          if (storedMemories) {
            if (io) {
              io.to(user.user_id).emit(
                "SynthesisStatus",
                "Creating memory node"
              );
            }
          }
        }
      }
    }

    //fetch past few questions and answers
    const cachekey = `user_id=${
      user.user_id
    }_time=${new Date().toDateString()}`;
    const pastConversation = await redisClient.exists(cachekey);

    const limit = user.PaymentStatus === true ? 10 : 5;
    if (pastConversation) {
      const Chats = await redisClient.lRange(cachekey, 0, limit); //last 10 chat messages retrive them
      const parsedChats = Chats.filter((jsonString) => {
        try {
          // Parse each individual string element
          return JSON.parse(jsonString);
        } catch (error) {
          console.error("Error parsing JSON message:", jsonString, error);
          // Return a placeholder or handle the error as needed
          return re.status(400).send({ error: "Parse Error", data: [] });
        }
      }); //last 10 chat messages retrive them
      GlobalContextObject.pastConversation = [...parsedChats];
    } else {
      const OldChats = await FetchPastMessagesFromDbAndCacheThem(user);
      if (OldChats.message) {
        GlobalContextObject.pastConversation = [
          "There is no conversation history of this user",
        ];
      } else {
        GlobalContextObject.OlderChats = [...OldChats];
      }
    }
    // const FinalContextString = generateXMLContext(GlobalContextObject);
    // if (!FinalContextString) {
    //   return { message: "Error while formatting the context object" };
    // }
    // console.log(JSON.stringify(GlobalContextObject));
    return JSON.stringify(GlobalContextObject);
  } catch (processingError) {
    console.error(processingError);
  }
}

//helper function to process document metadata information
async function ProcessDocumentInfoGathering(ReferenceArray, user) {
  const Document_Information = [];
  if (ReferenceArray.length > 0) {
    // Execute all doc fetches in parallel
    await Promise.all(
      ReferenceArray.map(async (req) => {
        const docId = req.arguments.doc_id;
        if (docId) {
          try {
            // Assuming config.execute returns { metadata: {...} }
            const result = await req.config.execute(docId, user);
            if (result) {
              Document_Information.push({
                doc_id: docId,
                result,
              }); //with the document_id identifier
            }
          } catch (e) {
            console.error(`Failed to fetch doc ${docId}`, e);
          }
        }
      })
    );
  }
  return Document_Information;
}

//helper function to process knowledgbase checking
async function ProcessKnowledgeBaseContextGathering(
  ReferenceArray,
  user,
  MetaDataArray
) {
  const Response = [];
  if (ReferenceArray.length > 0) {
    let i = 0;

    await Promise.all(
      ReferenceArray.map(async (req) => {
        try {
          console.log(MetaDataArray, "metadata array");
          //find the category-subCategory-description of the document from the metadat
          const current = MetaDataArray.find(
            (func) => func.doc_id === extractUUID(req?.arguments?.query) //if the query has the uuid of any document
          );
          let results;
          if (current) {
            results = await req.config.execute(
              current.result.metadata.category || "General",
              current.result.metadata.subCategory || "General",
              current.result.metadata.about,
              user
            );
          }
          //find fetch based on the metadata of other documents
          else if (MetaDataArray.length > 0) {
            let i = 0;
            while (i < MetaDataArray.length) {
              results = results = await req.config.execute(
                MetaDataArray[i].result.metadata.category || "General",
                MetaDataArray[i].result.metadata.subCategory || "General",
                MetaDataArray[i].result.metadata.about,
                user
              );
              i++;
            }
          }
          if (results) {
            Response.push({
              category: current.result.metadata.category,
              subcategory: current.result.metadata.subCategory,
              text: results,
            });
          }

          // console.log(result);
        } catch (error) {
          console.error(error, "error while fetching info from public sources");
        }
      })
    );
  }

  return Response;
}

//helped function to process web results
async function ProcessWebContextGathering(
  ReferenceArray,
  user,
  documentInfoArray
) {
  const FinalResult = [];
  try {
    await Promise.all(
      ReferenceArray.map(async (req) => {
        //query verification step

        for (let i = 0; i < documentInfoArray.length; i++) {
          //if the user query is not specified
          if (req.arguments.query.trim().toLowerCase() === "auto") {
            const result = await req.config.execute(
              documentInfoArray[i].result.metadata.about,
              user
            );
            // console.log(documentInfoArray[i]);
            FinalResult.push({
              query: documentInfoArray[i].result.metadata.about,
              webResults: result,
            }); //insert as a detailed object
          }
          //if the model adds a false query and mixes auto statement with users actual query
          else if (req.arguments.query.trim().toLowerCase() === "auto") {
            const finalQuery = rawQuery.replace(/AUTO/g, docContext);

            const result = await req.config.execute(finalQuery, user);
            FinalResult.push({
              query: documentInfoArray[i].result.metadata.about,
              webResults: result,
            }); //insert as a detailed object
          }
          //else when the query is stated clearly
          else {
            const result = await req.config.execute(
              req.arguments.query.trim().toLowerCase(),
              user
            );
            FinalResult.push({
              query: documentInfoArray[i].result.metadata.about,
              webResults: result,
            }); //insert as a detailed object
          }
        }
      })
    );

    return FinalResult;
  } catch (error) {
    console.error("Web Context Error:", error);
    return "";
  }
}

//checking the private document information of the user
async function CheckPrivateDocs(ReferenceArray, user, DocumentArray) {
  const FinalResult = [];
  await Promise.all(
    ReferenceArray.map(async (req) => {
      const document_id = req.arguments.doc_id;
      if (document_id !== "AUTO") {
        const documentQuery = DocumentArray.find(
          (func) => func.doc_id === document_id
        );
        // console.log(DocumentArray);
        const result = await req.config.execute(
          document_id,
          documentQuery.result.metadata.about,
          user
        ); //user file description as query
        FinalResult.push({ document_id: document_id, context: result });
      } else {
        const documentQuery = DocumentArray.find(
          (func) => func.doc_id !== document_id
        );
        // console.log(DocumentArray);
        const result = await req.config.execute(
          document_id,
          documentQuery.result.about,
          user
        ); //user file description as query
        FinalResult.push({ document_id: document_id, context: result });
      }
    })
  );
  return FinalResult;
}

//storing any memories for the user
async function HandleMemoryStorage(user, ReferenceArray) {}

//retrieving any memories
async function RetrieveMemories(user, ReferenceArray) {}

//fetch last few messages for reminder whwer we left off
async function FetchPastMessagesFromDbAndCacheThem(user) {
  const Limit = user.PaymentStatus === false ? 5 : 10;
  const { data, error } = await supabase
    .from("Conversation_History")
    .select("created_at,question,AiResponse")
    .eq("user_id", user.user_id)
    .limit(Limit);

  if (data.length === 0 || error) {
    return { message: "There is no past conversation history of this user" };
  }

  return data;
}

//uuid identifier

export function extractUUID(inputString) {
  if (!inputString || typeof inputString !== "string") return null;

  // The strict Regex for a UUID (Version 4 and others)
  // Matches: 8 chars - 4 chars - 4 chars - 4 chars - 12 chars
  const uuidRegex =
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

  const match = inputString.match(uuidRegex);

  // If found, return the clean UUID. If not, return null.
  return match ? match[0] : null;
}
