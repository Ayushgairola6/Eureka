import {
  CacheCurrentChat,
  redisClient,
} from "../CachingHandler/redisClient.js";
import {
  genAI,
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
import { supabase } from "../controllers/supabaseHandler.js";
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

  const rateLimitStatus = await ProcessUserQuery(user, "Synthesis");
  if (rateLimitStatus?.status.trim().toLowerCase().includes("not ok")) {
    return res.status(400).send({
      Answer: rateLimitStatus.message,
      message: "You have finished your free quota for the day.",
    });
  }
  if (user.PaymentStatus === false) {
    return res.status(400).json({ message: "" });
  }
  try {
    let FinalString = `${IDENTIFIER_PROMPT}_This is the users question=${question}and these are the manually selected user documents ${JSON.stringify(
      selectedDocuments
    )}`; //command for the model

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: FinalString }] }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 20,
        maxOutputTokens: 300, ///maximum 300 characters output
      },
    });

    const responseText = result.text;
    // console.log(responseText);
    // search_web(query="node-cron cron.schedule to keep server awake")
    // const responseText = `searchByName(filename="Nebuala_AI_Q3_Report.txt");ask_private(doc_id="AUTO", query="synthesize")`;
    if (!responseText) {
      await notifyMe(
        `Error while generating a response , the code execution results are these`
        // JSON.stringify(result.codeExecutionResult)
      );
      return res
        .status(400)
        .send({ message: "The server is very busy , please try again !" });
    }

    EmitEvent(user.user_id, "SynthesisStatus", "Understanding Request");

    const ExtractedFunctions = CentralFunctionProcessor(responseText); //clearing the function string
    // console.log(ExtractedFunctions);

    if (ExtractedFunctions.length < 0) {
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }

    // console.log(ExtractedFunctions);
    EmitEvent(user.user_id, "SynthesisStatus", "Creating functions ");

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
      selectedDocuments
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
      smartExecResult.pastConversation = [...OldChats];
    }

    const ModelResponse = await SynthesisResponseGenerator(
      JSON.stringify(smartExecResult.GlobalContextObject),
      question,
      user,
      SYNTHESIS_PROMPT
    );

    if (ModelResponse.error) {
      console.error(ModelResponse.error);
      return res
        .status(400)
        .send({ message: "Error while processing your request" });
    }

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

//central funciton that will process the request based on the functionname
export function CentralFunctionProcessor(resultString) {
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
export async function ExeCuteContextEngines(
  functionsArray,
  user,
  selectedDocuments
) {
  try {
    if (!functionsArray.length < 0) {
      return { error: "No functions found in the array" };
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

    EmitEvent(user.user_id, "SynthesisStatus", "Creating phases");

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
      user
    );

    if (doc_data && doc_data.length > 0) {
      GlobalContextObject.AlldocumentInformation = [...doc_data];
    }

    //ids that have been already fetched
    const alreadyFetchedIds = (doc_data || []).map(
      (doc) => doc.id || doc.doc_id
    );
    console.log(alreadyFetchedIds, "Already fetched document ids");
    const doc_data_fromName = await GetDocumentInfoFromName(
      phase1_Context,
      user,
      alreadyFetchedIds || []
    );

    console.log(doc_data_fromName, "document data from name");

    if (doc_data_fromName.length > 0) {
      GlobalContextObject.AlldocumentInformation = [
        ...(GlobalContextObject.AlldocumentInformation || []),
        ...(doc_data_fromName || []),
      ];
    }

    const private_doc_results = await SearchUserPrivateDocuments(
      phase2_Action,
      user,
      GlobalContextObject // Contains the AlldocumentInformation we just found
    );

    if (private_doc_results?.length > 0) {
      GlobalContextObject.privateFilesResponse = [...private_doc_results];
    }
    if (private_doc_results?.length > 0) {
      GlobalContextObject.privateFilesResponse = [...private_doc_results];
    }
    //get iformation from pubic contributed knowledgebase
    const knowledgebaseContext = await GetKnowledgebaseInfo(
      phase1_Context,
      GlobalContextObject,
      user
    );

    if (knowledgebaseContext && knowledgebaseContext.length > 0) {
      GlobalContextObject.knowledgebaseData = [...knowledgebaseContext];
    }

    //get information from web if required
    const webContext = await CheckWebForInformation(
      phase2_Action,
      GlobalContextObject,
      user
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
    console.error(processingError);
    return { error: processingError };
  }
}
