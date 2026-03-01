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
  GatherCertainChunks,
  GetChatsForContext,
  SearchUserPrivateDocuments,
} from "./phase2_action.js";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
import {
  HandleDocumentMetadataGathering,
  SynthsisOrchrestrator,
} from "./PreprocessingHandler.js";
import { AllowedFileTypes } from "../FilerParsers/FilerParser.js";

// checks the count of documents mentioned in the user-prompt
export const ExtractFileNamesFromPrompt = (prompt) => {
  if (!prompt || typeof prompt !== "string") return [];

  // Build regex dynamically from allowed extensions
  const extensionPattern = AllowedFileTypes.join("|");
  const fileRegex = new RegExp(
    `\\b([\\w\\-\\.]+\\.(${extensionPattern}))\\b`,
    "gi"
  );

  const matches = prompt.match(fileRegex) || [];

  // Deduplicate and clean
  const unique = [...new Set(matches.map((f) => f.trim().toLowerCase()))];
  return unique;
};
// guardrail function that handles the number of documents selected count
export const ValidateDocumentLimit = (prompt, plan_type) => {
  const limit = plan_type === "free" ? 2 : plan_type === "sprint pass" ? 3 : 5;

  const foundFiles = ExtractFileNamesFromPrompt(prompt);

  if (foundFiles.length > limit) {
    return {
      allowed: false,
      found: foundFiles,
      limit,
      message: `You mentioned ${foundFiles.length} documents but your ${plan_type} plan allows up to ${limit} at once. Please reduce or upgrade.`,
    };
  }

  return { allowed: true, found: foundFiles, limit };
};

// the central processing of synthesisi modee
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

  ///check the user plan status and validity
  const { status, error, plan_status, plan_type } = await CheckUserPlanStatus(
    user.user_id
  );

  if (status === false || error || !plan_type) {
    return res.status(400).send({
      message: "Something went wrong while checking your plan status",
    });
  }

  const limit = plan_type === "free" ? 2 : plan_type === "sprint pass" ? 3 : 5;

  if (selectedDocuments && selectedDocuments?.length > limit) {
    return res.status(400).json({
      message: `You can select up to ${DOC_LIMITS[plan_type]} documents at once on your current plan. Upgrade to Pro for higher limits.`,
    });
  }

  const isAllowed = ValidateDocumentLimit(question, plan_type);

  if (isAllowed?.allowed === false) {
    return res.status(400).json({
      message: isAllowed?.message,
    });
  }
  // gather the metadata of manually selected documents
  const metadata = await HandleDocumentMetadataGathering(
    selectedDocuments,
    user
  );

  // if the metadata is empty as well as the selecteddocuments are empty that
  //means there are no such documents in the db
  if (metadata.length === 0 && selectedDocuments.length > 0) {
    return res.status(400).send({ message: "No valid documents found." });
  }

  //if metadata was updated send the user an update
  if (metadata) {
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "Metadata_analysis",
        data: [
          `Analyzed the metadata of the for selected-documents ${selectedDocuments?.flat(
            1
          )}`,
        ],
      },
    });
  }

  try {
    // a dynamic context for
    const context = `
userQuery=${question}
selectedDocuments=${JSON.stringify(selectedDocuments)}
documentMetadata=${JSON.stringify(metadata)}

`;

    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "Understanding Request",
        data: ["I am now zeroing down on the user request"],
      },
    });

    const message = {
      id: userMessageId, //users message Id
      sent_by: "You", //sent by the user
      message: { isComplete: true, content: question },
      sent_at: currentTime,
    };
    await CacheCurrentChat(message, req.user);

    const Orechrestratedresults = await SynthsisOrchrestrator({
      user,
      MessageId,
      context,
      selectedDocuments,
      question,
      plan_type,
    });

    if (!Orechrestratedresults || Orechrestratedresults?.error) {
      notifyMe(
        `Error from the Synthesis recursive orchrestration handler in identifier.js line 118 file\n`,
        JSON.stringify(Orechrestratedresults)
      );
      console.log(`error in synthesis orchrestrator\n`, Orechrestratedresults);
      return res.status(400).send({
        message:
          "It seems like our AI models are very overloaded right now please wait a bit while we try to resolve this problem.",
      });
    }

    // console.log(ExtractedFunctions);
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "Creating functions",
        data: [JSON.stringify(Orechrestratedresults?.functions)],
      },
    });

    // if the llm just sent a message
    if (!Orechrestratedresults?.answer) {
      return res.status(400).json({
        message:
          Orechrestratedresults?.error ||
          "It seems like our AI models are very overloaded right now please wait a bit while we try to resolve this problem.",
      });
    }
    const ModelResponse = Orechrestratedresults.answer;
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
      icon: Orechrestratedresults?.favicon,
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

  // if the llm has responded with a simple answer return
  if (ParsedObject?.direct_answer && ParsedObject.direct_answer.trim() !== "") {
    return {
      confidence: "high",
      message: ParsedObject.direct_answer, // now message is actually returned
      PreProcessFunctions: [],
    };
  }

  // if there is no message as well as there is not functions
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
  const PreProcessFunctions = [];

  const list = ParsedObject?.suggested_functions;
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
  functionsArray, //functions that are required
  user, //user object
  selectedDocuments, //manually selected functions
  MessageId, //MessageId,
  question,
  plan_type
) {
  try {
    let GlobalContextObject = {
      AlldocumentInformation: [],
      privateFilesResponse: [],
      knowledgebaseData: [],
      webSearchResults: [],
      oldMemories: [],
      pastConversation: [],
    };
    if (functionsArray?.PreProcessFunctions?.length === 0) {
      return {
        GlobalContextObject,
        favicons: [],
      };
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

    // if the data of document needs to be extracted by Id
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

    const certainChunks = await GatherCertainChunks(
      phase2_Action,
      user,
      GlobalContextObject,
      MessageId,
      question,
      plan_type
    );

    if (certainChunks?.length > 0) {
      GlobalContextObject.privateFilesResponse = [
        ...GlobalContextObject?.privateFilesResponse,
        ...certainChunks,
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
      GlobalContextObject.privateFilesResponse = [
        ...GlobalContextObject.privateFilesResponse,
        ...private_doc_results,
      ];
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
      MessageId,
      plan_type
    );

    let favicons = [];
    if (webContext && webContext.results) {
      GlobalContextObject.webSearchResults = [...webContext.results];
      if (webContext.favicons) {
        favicons = [...webContext.favicons];
      }
    }

    return { GlobalContextObject, favicons };
  } catch (processingError) {
    notifyMe(
      "An error occured in synthesis context gathering algorithm at line:380",
      processingError
    );
    return { error: processingError };
  }
}
