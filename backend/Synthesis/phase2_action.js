import { redisClient } from "../CachingHandler/redisClient.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import {
  CheckPrivateDocs,
  FetchPastMessagesFromDbAndCacheThem,
  getSelectedChunks,
  HandleMemoryStorage,
  ProcessWebContextGathering,
} from "./helper_functions.js";
import { ToolRegistry } from "./tools.js";

export async function CheckWebForInformation(
  phase2_Action,
  GlobalContextObject,
  user,
  MessageId,
  plan_type
) {
  const needs_web_results = phase2_Action.filter(
    (li) => li.function_name === "search_web"
  );

  if (needs_web_results.length > 0) {
    const webResult = await ProcessWebContextGathering(
      needs_web_results,
      user,
      GlobalContextObject.AlldocumentInformation,
      MessageId,
      plan_type
    );

    if (webResult?.FinalResult?.length > 0) {
      EmitEvent(user.user_id, "query_status", {
        MessageId,
        status: {
          message: `Searching web`,
          data: [
            `Searched web for ${JSON.stringify(
              webResult.FinalResult.slice(0, 50)
            )}`,
          ],
        },
      });

      return {
        results: webResult.FinalResult,
        favicons: webResult.AllFavicons,
      };
    }
  }
  return [];
}

//gathers information from uses private documents by fetching all chunks
export async function SearchUserPrivateDocuments(
  phase2_Action,
  user,
  GlobalContextObject,
  MessageId
) {
  const askPrivateRequests = phase2_Action.filter(
    (li) => li.function_name === "get_all_chunks"
  );

  // We need the config to execute later
  if (askPrivateRequests.length > 0) {
    const privateToolConfig = ToolRegistry["get_all_chunks"];

    const privateDocsMap = new Map();

    let fallbackQuery = "Extract relevant information based on user request";

    askPrivateRequests.forEach((req) => {
      const rawId = req.arguments.doc_id;
      const rawQuery = req.arguments.query;
      const cleanId = extractUUID(rawId); // to see if the model mixed the document_id with some false keyword

      // CASE A: Valid, Specific UUID
      if (cleanId) {
        privateDocsMap.set(cleanId, {
          arguments: {
            doc_id: cleanId,
            query: rawQuery || fallbackQuery,
          }, //in the same format we extract from the function
          config: privateToolConfig,
        });
      }
    });

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
      EmitEvent(user.user_id, "query_status", {
        MessageId,
        status: {
          message: `Reading docs`,
          data: [`Reading documents ${JSON.stringify(CleanedRequest)}`],
        },
      });

      const PrivateInfo = await CheckPrivateDocs(
        CleanedRequest,
        user,
        GlobalContextObject.AlldocumentInformation
      );
      if (PrivateInfo) {
        return PrivateInfo;
      }
    }
  }
  return [];
}

//gather only certain chunks
export async function GatherCertainChunks(
  phase2_Action,
  user,
  GlobalContextObject,
  MessageId,
  question,
  plan_type
) {
  const askPrivateRequests = phase2_Action.filter(
    (li) => li.function_name === "get_selected_chunks"
  );

  if (askPrivateRequests?.length === 0) {
    return [];
  }
  const info = [];
  const selectedDocInfo = await getSelectedChunks(
    askPrivateRequests,
    user,
    question,
    plan_type
  );

  if (selectedDocInfo && selectedDocInfo?.length > 0) {
    info.push(...selectedDocInfo);
  }

  return info;
}

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

export async function StoreUserMemory(phase2_Action, user, MessageId) {
  const needs_to_store = phase2_Action.filter(
    (li) => li.function_name === "store_memory" // ← was get_memory
  );
  if (needs_to_store.length > 0) {
    return await HandleMemoryStorage(user, needs_to_store);
  }
}

export async function GetUserMemory(phase2_Action, user, MessageId) {
  const needs_memory = phase2_Action.filter(
    (li) => li.function_name === "get_memory" // ← was store_memory
  );
  if (needs_memory.length > 0) {
    return await RetrieveMemories(user, needs_memory);
  }
}
export async function GetChatsForContext(user, plan_type) {
  const cachekey = `user_id=${user.user_id}_time=${new Date().toDateString()}`;
  const pastConversation = await redisClient.exists(cachekey);

  const limit = plan_type !== "free" ? 10 : 5;
  if (pastConversation) {
    const Chats = await redisClient.lRange(cachekey, 0, limit);
    const parsedChats = Chats.map((jsonString) => {
      try {
        return JSON.parse(jsonString);
      } catch {
        return null;
      }
    }).filter(Boolean);
    return parsedChats; // ← was missing
  } else {
    const OldChats = await FetchPastMessagesFromDbAndCacheThem(user);
    if (OldChats.message) {
      return [];
    }
    return OldChats;
  }
}
