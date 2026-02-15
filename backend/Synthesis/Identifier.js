import {
  CacheCurrentChat,
  // redisClient,
} from "../CachingHandler/redisClient.js";
import {
  IdentifyUserRequest,
  // genAI,
  SynthesisResponseGenerator,
} from "../controllers/ModelController.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";

import { IDENTIFIER_PROMPT, SYNTHESIS_PROMPT } from "../Prompts/Prompts.js";
import { ToolRegistry } from "./tools.js";
import {
  currentTime,
  StoreQueryAndResponse,
} from "../controllers/fileControllers.js";
import { ProcessUserQuery } from "../controllers/UserCreditLimitController.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
// import { supabase } from "../controllers/supabaseHandler.js";
import {
  GetDocumentInfo,
  GetDocumentInfoFromName,
  GetKnowledgebaseInfo,
} from "./phase1_context.js";
import {
  CheckWebForInformation,
  GetChatsForContext,
  SearchUserPrivateDocuments,
} from "./phase2_action.js";
import {
  HandlePreProcessFunctions,
  ProcessDocumentInfoGathering,
} from "./helper_functions.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
//function to identify the functions needed to process the request
// import jsonData from "../Tests/response.json" with { type: "json" };
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

  const rateLimitStatus = await ProcessUserQuery(user, "Synthesis");
  if (rateLimitStatus?.status === false) {
    return res.status(400).send({
      message:
        "You have exhausted your monthly quota, please wait till next month or get our premium pass and enjoy all features without limits",
      Answer:
        "You have exhausted your monthly quota, please wait till next month or get our premium pass and enjoy all features without limits",
    });
  }

  const { status, error, plan_status, plan_type } = await CheckUserPlanStatus(
    user.user_id
  );

  if (status === false || error || !plan_type) {
    return res.status(400).send({
      message: "Something went wrong while checking your plan status",
    });
  }
  let metadata = [];
  if (selectedDocuments?.length > 0) {
    const results = await Promise.all(
      selectedDocuments.map(async (id) => {
        if (!id) return null;

        const { data, error } = await supabase
          .from("Contributions")
          .select("feedback,metadata")
          .eq("document_id", id)
          .eq("user_id", user.user_id)
          .single();

        if (error || !data) {
          return { error: true, id };
        }

        return data; // Return valid data
      })
    );

    const metadata = [];
    for (const result of results) {
      if (!result) continue; // Skip nulls

      // Check for the error flag we returned above
      if (result.error) {
        return res.status(400).send({
          message: `Document with ID ${result.id} not found or access denied.`,
        });
      }

      metadata.push(result);
    }

    // 3. Final Check
    if (metadata.length === 0 && selectedDocuments.length > 0) {
      return res.status(400).send({ message: "No valid documents found." });
    }
  }

  //if metadata was updated send the user an update
  if (metadata) {
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "Metadata_analysis",
        data: [
          `Analyzed the metadata of the for selected-documents ${JSON.stringify(
            selectedDocuments
          )}`,
        ],
      },
    });
  }

  try {
    const context = `This is the users question=${question}and these are the manually selected user documents ${JSON.stringify(
      selectedDocuments
    )}and this is the information of selected documents=${
      metadata ? metadata : "['No data found in the database']"
    } `; //command for the model

    const responseText = await IdentifyUserRequest(context, IDENTIFIER_PROMPT);
    if (!responseText || responseText?.error) {
      notifyMe(
        `Error while generating a response , the code execution results are these`
        // JSON.stringify(result.codeExecutionResult)
      );
      return res
        .status(400)
        .send({ message: "The server is very busy , please try again !" });
    }

    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "Understanding Request",
        data: ["Calling tools"],
      },
    });

    const ExtractedFunctions = CentralFunctionProcessor(
      responseText,
      user,
      MessageId
    );

    //if there is no confidence score or the functions or error
    if (
      !ExtractedFunctions?.confidence ||
      ExtractedFunctions.PreProcessFunctions.length === 0 ||
      ExtractedFunctions.error
    ) {
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }

    //if there is a message
    if (ExtractedFunctions.message) {
      return res.status(200).send({
        message: ExtractedFunctions.message,
        favicon: { MessageId, icon: [] },
      });
    }

    let PreProcessedData;
    //if the confidence is low call the functions that are required
    if (ExtractedFunctions.confidence === "low") {
      PreProcessedData = await HandlePreProcessFunctions(
        ExtractedFunctions.PreProcessFunctions,
        user,
        selectedDocuments
      );

      if (!PreProcessedData || PreProcessedData?.error) {
        return res.status(400).send({
          message:
            "Looks like something went wrong while processing your request.",
        });
      }

      // if both the fields are empty
      if (
        PreProcessedData.AlldocumentInformation?.length === 0 &&
        PreProcessedData.context_by_uuid.length === 0
      ) {
        return res.status(400).send({
          message:
            "Looks like something went wrong while processing your request.",
        });
      }
    }

    //if there is preprocesed data re run the loop
    const SecondTimeresponseText = await IdentifyUserRequest(
      context,
      IDENTIFIER_PROMPT
    );
    if (!SecondTimeresponseText || SecondTimeresponseText?.error) {
      notifyMe(
        `Error while generating a response , the code execution results are these`
        // JSON.stringify(result.codeExecutionResult)
      );
      return res
        .status(400)
        .send({ message: "The server is very busy , please try again !" });
    }

    const ExtractFUnctionsAgain = CentralFunctionProcessor(
      SecondTimeresponseText,
      user,
      MessageId
    ); //clearing the function string

    //if there is no confidence score or the functions or error
    if (
      !ExtractFUnctionsAgain?.confidence ||
      ExtractFUnctionsAgain.PreProcessFunctions.length === 0 ||
      ExtractFUnctionsAgain.error
    ) {
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }

    // console.log(ExtractedFunctions);
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "Creating functions",
        data: [JSON.stringify(ExtractFUnctionsAgain)],
      },
    });

    const message = {
      id: userMessageId, //users message Id
      sent_by: "You", //sent by the user
      message: { isComplete: true, content: question },
      sent_at: currentTime,
    };
    await CacheCurrentChat(message, req.user);

    const smartExecResult = await ExeCuteContextEngines(
      ExtractFUnctionsAgain,
      user,
      selectedDocuments,
      MessageId
    );

    if (!smartExecResult.GlobalContextObject || smartExecResult.error) {
      console.error("The execution results error", smartExecResult.error);
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }

    //get prevoious chats and append them as well
    const OldChats = await GetChatsForContext(user);
    if (OldChats.length !== 0) {
      smartExecResult.GlobalContextObject.pastConversation = [...OldChats];
    }

    const ModelResponse = await SynthesisResponseGenerator(
      JSON.stringify(smartExecResult.GlobalContextObject),
      question,
      user,
      SYNTHESIS_PROMPT,
      plan_type
    );

    if (ModelResponse.error) {
      console.error(ModelResponse.error);
      return res
        .status(400)
        .send({ message: "Error while processing your request" });
    }
    // const ModelResponse = JSON.stringify(smartExecResult.GlobalContextObject);

    const AiMessage = {
      id: MessageId,
      sent_by: "AntiNode", //sent by the user
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
    const formattedFavicon = {
      MessageId,
      icon: smartExecResult.favicons,
    };
    return res.status(200).send({
      message: "Response generated",
      Answer: ModelResponse,
      favicon: formattedFavicon,
    });
  } catch (SynthesisError) {
    console.error(SynthesisError);
    await notifyMe(
      "An error occured in the synthesis hanlder line 185 identifier.js",
      SynthesisError
    );
    return res
      .status(500)
      .send({ message: "The server failed to generate a response" });
  }
}

// checks and parse the LLm response for tool and other parameter extraction
function safeJsonParse(rawResponse) {
  if (!rawResponse || typeof rawResponse !== "string") return null;

  let cleanString = rawResponse.trim();

  // 1. Remove Markdown Code Blocks (```json ... ``` or ``` ...)
  // This is the most common cause of the SyntaxError you're seeing
  cleanString = cleanString
    .replace(/^```(?:json)?\n?/i, "")
    .replace(/\n?```$/i, "");

  // 2. Extract only the content between the first { and the last }
  // This handles cases where the model adds "Here is the JSON:" text
  const firstBrace = cleanString.indexOf("{");
  const lastBrace = cleanString.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanString = cleanString.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleanString);
  } catch (parseError) {
    console.error("Critical Parse Error. Raw string was:", rawResponse);

    // LAST RESORT: Try to fix common minor syntax errors (like trailing commas)
    try {
      // Very basic fix for trailing commas before a closing brace/bracket
      const fixedString = cleanString.replace(/,\s*([\]}])/g, "$1");
      return JSON.parse(fixedString);
    } catch (finalError) {
      return null;
    }
  }
}
//central funciton that will process the request based on the functionname
export function CentralFunctionProcessor(resultString, user, MessageId) {
  const ParsedObject = safeJsonParse(resultString);

  if (!ParsedObject) {
    notifyMe(
      `The orchrestration failed to parse the model response for this user=${user.user_id} with the following model response string:`,
      resultString
    );
    return {
      error:
        "I had some internal errors that is why right now i am unable to create a plan for your request please wait before trying again.",
    };
  }
  // functions that are needed to be proceeded to get a more distinct response
  const PreProcessFunctions = [];

  // if the confidence score it low get the functions that are needed in order to find the documents for the user
  //find what are the suggested functions by the model
  if (!ParsedObject?.suggested_functions) {
    return { error: "Model suggested no functions to process the prompt" };
  }

  EmitEvent(user.user_id, "query_status", {
    MessageId,
    status: {
      message: "new_thread",
      data: [ParsedObject?.thought],
    },
  });
  //trigger the function asked by the model cause we always need to filter out the functions
  const list = ParsedObject.suggested_functions;
  if (list?.length > 0) {
    list.forEach((obj) => {
      PreProcessFunctions.push({
        function_name: obj.function_name,
        arguments: obj.arguments,
      });
    });
  }
  if (ParsedObject?.confidence_score && ParsedObject.confidence_score < 0.5) {
    return { confidence: "low", PreProcessFunctions };
  }

  return { confidence: "high", PreProcessFunctions };
}

//call the functions and execute them based on their priority list from the ToolRegistry
export async function ExeCuteContextEngines(
  functionsArray,
  user,
  selectedDocuments,
  MessageId
) {
  try {
    if (functionsArray?.PreProcessFunctions?.length === 0) {
      return { error: "No functions found in the array" };
    }

    //distributing requirement in two phases
    let phase1_Context = [];
    let phase2_Action = [];

    //distributing the context and action
    functionsArray.PreProcessFunctions.forEach((func) => {
      const config = ToolRegistry[func.function_name];
      if (!config) return; // Skip unknown functions

      if (config.importance === 1) {
        phase1_Context.push({ ...func, config });
      } else {
        phase2_Action.push({ ...func, config });
      }
    });

    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "Creating phases",

        data: [
          phase1_Context.length > 0
            ? JSON.stringify(phase1_Context)
            : phase2_Action.length > 0
            ? JSON.stringify(phase2_Action)
            : ["No functions required"],
        ],
      },
    });

    let GlobalContextObject = {
      AlldocumentInformation: [],
      privateFilesResponse: [],
      knowledgebaseData: [],
      webSearchResults: [],
      oldMemories: [],
      pastConversation: [],
    }; //will contain the all the context information source and actual context

    //always get the document info if selected or typed
    const doc_data = await GetDocumentInfo(
      phase1_Context,
      selectedDocuments,
      user,
      MessageId
    );

    if (doc_data && doc_data.length > 0) {
      GlobalContextObject.AlldocumentInformation = [...doc_data];
    }

    //ids that have been already fetched
    const alreadyFetchedIds = (doc_data || []).map(
      (doc) => doc.id || doc.doc_id
    );

    const doc_data_fromName = await GetDocumentInfoFromName(
      phase1_Context,
      user,
      alreadyFetchedIds || [],
      MessageId
    );

    if (doc_data_fromName.length > 0) {
      GlobalContextObject.AlldocumentInformation = [
        ...(GlobalContextObject.AlldocumentInformation || []),
        ...(doc_data_fromName || []),
      ];
    }

    // handle by id
    const private_doc_results = await SearchUserPrivateDocuments(
      phase2_Action,
      user,
      GlobalContextObject,
      MessageId // Contains the AlldocumentInformation we just found
    );

    if (private_doc_results?.length > 0) {
      GlobalContextObject.privateFilesResponse = [...private_doc_results];
    }

    //get iformation from pubic contributed knowledgebase
    const knowledgebaseContext = await GetKnowledgebaseInfo(
      phase1_Context,
      GlobalContextObject,
      user,
      MessageId
    );

    if (knowledgebaseContext && knowledgebaseContext.length > 0) {
      GlobalContextObject.knowledgebaseData = [...knowledgebaseContext];
    }

    //get information from web if required
    const webContext = await CheckWebForInformation(
      phase2_Action,
      GlobalContextObject,
      user,
      MessageId
    );

    let favicons = [];
    if (webContext && webContext.results) {
      GlobalContextObject.webSearchResults = [...webContext.results];
      if (webContext.favicons) {
        favicons = [...webContext.favicons];
      }
    }

    //if private documents are needed to be scanned

    // const private_doc_results = await SearchUserPrivateDocuments(
    //   phase2_Action,
    //   user,
    //   GlobalContextObject
    // );
    // //if older memories are required
    // console.log("private_doc_results :,", private_doc_results);

    // if (private_doc_results?.length > 0) {
    //   GlobalContextObject.privateFilesResponse = [...private_doc_results];
    // }

    return { GlobalContextObject, favicons };
  } catch (processingError) {
    await notifyMe(
      "An error occured in synthesis context gathering algorithm at line:380",
      processingError
    );
    return { error: processingError };
  }
}
