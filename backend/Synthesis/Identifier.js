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
import { ReferenceModelToJSON } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/assistant_data/index.js";
import { Result } from "neo4j-driver";
import { request } from "http";

//function to identify the functions needed to process the request

export async function IdentifyRequestInputs(req, res) {
  const user = req.user;
  if (!user) {
    return res.status(401).send({ message: "Please log in to continue" });
  }

  const { question, MessageId, userMessageId } = req.body;

  if (
    !question ||
    typeof question !== "string" ||
    !MessageId ||
    typeof MessageId !== "string" ||
    !userMessageId ||
    typeof userMessageId !== "string"
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
    if (!responseText) {
      await notifyMe(
        `Error while generating a response , the code execution results are these`,
        JSON.stringify(result.codeExecutionResult)
      );
      return { error: "The server is very busy , please try again !" };
    }

    const ExtractedFunctions = CentralFunctionProcessor(responseText); //clearing the function string
    // console.log(ExtractedFunctions);

    if (ExtractedFunctions.length < 0) {
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
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
      user
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

    // storing the convo in solid state db
    const StoreChats = await StoreQueryAndResponse(
      user.user_id,
      question,
      ModelResponse
    );
    if (StoreChats.error) {
      await notifyMe(
        `Error while storing response history ${StoreChats.error}`
      );
    }

    // console.log(smartExecResult);
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
      FilteredFunc.push({
        function_name: funcName,
        arguments: args,
      });
    }
  });

  return FilteredFunc;
}

//call the functions and execute them based on their priority list from the ToolRegistry
async function ExeCuteContextEngines(functionsArray, user) {
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

      // console.log(needs_doc_info, "needs_Dcos array");

      // 1-a: if the information of the documents is required to fetch the responses
      if (needs_doc_info) {
        const docdata = await ProcessDocumentInfoGathering(
          needs_doc_info,
          user
        );
        //if there is atleast one document information
        if (docdata.length !== 0) {
          GlobalContextObject.AlldocumentInformation = [...docdata]; //append it to the globl context
        }
      }

      //1-b: if there is a a need to look for information in public knowledgebase
      //if there is a need to search the knowledgebase
      const needs_to_search_knowledgebase = phase1_Context.filter(
        (li) => li.function_name === "search_knowledge"
      );

      const PublicKnowledge = await ProcessKnowledgeBaseContextGathering(
        needs_to_search_knowledgebase,
        user,
        GlobalContextObject.AlldocumentInformation //array containing the information of the document and its metadata
      );

      // console.log(PublicKnowledge);
      if (PublicKnowledge.length > 0) {
        GlobalContextObject.knowledgebaseData = [...PublicKnowledge];
      }

      //executing the phase 2
      if (phase2_Action.length > 0) {
        //list of things to web search
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
            GlobalContextObject.webSearchResults = [...webResult];
          }
        }

        //if private documents are needed to be scanned
        const needsToSearchPrivateDocs = phase2_Action.filter(
          (li) => li.function_name === "ask_private"
        );

        if (needsToSearchPrivateDocs.length > 0) {
          const PrivateInfo = await CheckPrivateDocs(
            needsToSearchPrivateDocs,
            user,
            GlobalContextObject.AlldocumentInformation
          );

          if (PrivateInfo.length > 0) {
            // console.log("Information from privatedocuments", PrivateInfo);
            GlobalContextObject.webSearchResults = [...PrivateInfo];
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
      const parsedChats = Chats.map((jsonString) => {
        try {
          // Parse each individual string element
          return JSON.parse(jsonString);
        } catch (error) {
          console.error("Error parsing JSON message:", jsonString, error);
          // Return a placeholder or handle the error as needed
          return re.status(400).send({ error: "Parse Error", data: [] });
        }
      }); //last 10 chat messages retrive them
      GlobalContextObject.pastConversation = [parsedChats];
    }
    const FinalContextString = generateXMLContext(GlobalContextObject);
    if (!FinalContextString) {
      return { message: "Error while formatting the context object" };
    }
    return FinalContextString;
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
        const docId = req.arguments.doc_id; //id of the respective document
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
    await Promise.all(
      ReferenceArray.map(async (req) => {
        try {
          const current = MetaDataArray.find(
            (func) => func.doc_id === req.arguments.query
          );
          const result = await req.config.execute(
            current.result.metadata.category || "General",
            current.result.metadata.subCategory || "General",
            current.result.metadata.about,
            user
          );

          if (result) {
            Response.push({
              category: current.result.metadata.category,
              subcategory: current.result.metadata.subCategory,
              text: result,
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
      // console.log(req.arguments);
      const document_id = req.arguments.doc_id;
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
    })
  );
  return FinalResult;
}

//storing any memories for the user
async function HandleMemoryStorage(user, ReferenceArray) {}

//retrieving any memories
async function RetrieveMemories(user, ReferenceArray) {}

//generates xml for the understanding of the model

function generateXMLContext(ctx) {
  let xml = "<context_data>\n";

  // 1. Documents Available (Fixing the nested 'result' structure)
  if (ctx.AlldocumentInformation && ctx.AlldocumentInformation.length > 0) {
    xml += `  <documents_available>\n`;
    ctx.AlldocumentInformation.forEach((doc) => {
      // Safe access to the nested structure in your JSON
      const info = doc.result || {};
      const meta = info.metadata || {};

      xml += `    <doc_meta id="${doc.doc_id}">\n`;
      xml += `      <title>${
        info.feedback ? info.feedback.trim() : "Untitled Document"
      }</title>\n`;
      xml += `      <category>${meta.category || "General"}</category>\n`;
      xml += `      <sub_category>${
        meta.subCategory || "General"
      }</sub_category>\n`;
      xml += `      <summary>${meta.about || ""}</summary>\n`;
      xml += `    </doc_meta>\n`;
    });
    xml += `  </documents_available>\n`;
  }

  // 2. Knowledge Base (Handling the "Invalid arguments" error)
  if (ctx.knowledgebaseData && ctx.knowledgebaseData.length > 0) {
    xml += `  <knowledge_base>\n`;
    ctx.knowledgebaseData.forEach((item) => {
      // Check if 'text' is an error object or a string
      let content = item.text;
      if (typeof content === "object" && content.message) {
        content = `Error: ${content.message}`;
      }

      xml += `    <entry category="${item.category}" sub_category="${item.subcategory}">\n`;
      xml += `      ${content}\n`;
      xml += `    </entry>\n`;
    });
    xml += `  </knowledge_base>\n`;
  }

  // 3. Web/Context Results (Handling your raw chunk text)
  // Note: Your JSON shows vector chunks inside 'webSearchResults'.
  // We will preserve the formatting so the LLM can read the 'text=' parts.
  if (ctx.webSearchResults && ctx.webSearchResults.length > 0) {
    xml += `  <web_search>\n`;
    ctx.webSearchResults.forEach((item) => {
      xml += `    <result related_doc_id="${item.document_id}">\n`;
      // We escape likely XML-breaking chars just in case, though usually fine
      xml += `      ${(item.context || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}\n`;
      xml += `    </result>\n`;
    });
    xml += `  </web_search>\n`;
  }

  // 4. User Memories
  if (ctx.oldMemories && ctx.oldMemories.length > 0) {
    xml += `  <user_memory>\n`;
    ctx.oldMemories.forEach((mem) => {
      xml += `    <fact>${JSON.stringify(mem)}</fact>\n`;
    });
    xml += `  </user_memory>\n`;
  }
  if (ctx.pastConversation) {
    xml += `<Past Conversation>\n`;
    ctx.pastConversation.forEach((mess) => {
      xml += `<message>${JSON.stringify(mess)}<message>`;
    });
    xml += `<Past Conversation>\n`;
  }
  xml += "</context_data>";
  return xml;
}
