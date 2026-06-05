import { redisClient } from "../CachingHandler/redisClient.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import {
    CheckPrivateDocs,
    FetchPastMessagesFromDbAndCacheThem,
    getSelectedChunks,
    HandleMemoryStorage,
    ProcessWebContextGathering,
    RetrieveOlderMemories,
} from "./helper_functions.js";
import { ToolRegistry } from "./tools.js";

export async function CheckWebForInformation(phase2_Action, GlobalContextObject, user, MessageId, plan_type) {
    const needs_web = phase2_Action.filter((li) => li.function_name === "search_web");
    if (!needs_web.length) return [];

    const webResult = await ProcessWebContextGathering(
        needs_web,
        user,
        GlobalContextObject.AlldocumentInformation,
        MessageId,
        plan_type
    );

    if (webResult?.FinalResult?.length > 0) {
        EmitEvent(user.user_id, "query_status", {
            MessageId,
            status: { message: "Searching web", data: ["Searched web"] },
        });
        return { results: webResult.FinalResult, favicons: webResult.AllFavicons };
    }
    return [];
}

export async function SearchUserPrivateDocuments(phase2_Action, user, GlobalContextObject, MessageId) {
    const askPrivateRequests = phase2_Action.filter((li) => li.function_name === "get_all_chunks");
    if (!askPrivateRequests.length) return [];

    const privateToolConfig = ToolRegistry["get_all_chunks"];
    const fallbackQuery = "Extract relevant information based on user request";
    const docsMap = new Map();

    for (const req of askPrivateRequests) {
        const cleanId = extractUUID(req.arguments.doc_id);
        if (cleanId) {
            docsMap.set(cleanId, {
                arguments: { doc_id: cleanId, query: req.arguments.query || fallbackQuery },
                config: privateToolConfig,
            });
        }
    }

    for (const docObj of GlobalContextObject.AlldocumentInformation || []) {
        const docId = docObj.doc_id || docObj.id;
        if (docId && !docsMap.has(docId)) {
            docsMap.set(docId, {
                arguments: { doc_id: docId, query: fallbackQuery },
                config: privateToolConfig,
            });
        }
    }

    const cleanedRequests = Array.from(docsMap.values());
    if (!cleanedRequests.length) return [];

    EmitEvent(user.user_id, "query_status", {
        MessageId,
        status: { message: "Reading docs", data: ["Reading documents"] },
    });

    return (await CheckPrivateDocs(cleanedRequests, user, GlobalContextObject.AlldocumentInformation)) || [];
}

export async function GatherCertainChunks(phase2_Action, user, GlobalContextObject, MessageId, question, plan_type) {
    const requests = phase2_Action.filter((li) => li.function_name === "get_selected_chunks");
    if (!requests.length) return [];
    return (await getSelectedChunks(requests, user, question, plan_type)) || [];
}

export function extractUUID(inputString) {
    if (!inputString || typeof inputString !== "string") return null;
    const match = inputString.match(
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    );
    return match ? match[0] : null;
}

export async function StoreUserMemory(phase2_Action, user) {
    const needs_to_store = phase2_Action.filter((li) => li.function_name === "store_memory");
    if (needs_to_store.length > 0) return await HandleMemoryStorage(user, needs_to_store);
}

export async function GetUserMemory(phase2_Action, user) {
    const needs_memory = phase2_Action.filter((li) => li.function_name === "get_memory");
    if (needs_memory.length > 0) return await RetrieveOlderMemories(user, needs_memory);
}

export async function GetChatsForContext(user, plan_type) {
    const cachekey = `user_id=${user.user_id}_time=${new Date().toDateString()}`;
    const limit = plan_type !== "free" ? 10 : 3;

    try {
        const exists = await redisClient.exists(cachekey);
        if (exists) {
            const chats = await redisClient.lRange(cachekey, -limit, -1);
            return chats
                .map((item) => {
                    try {
                        const parsed = JSON.parse(item);
                        return parsed.AI_response ? JSON.parse(parsed.AI_response) : parsed;
                    } catch {
                        return null;
                    }
                })
                .filter(Boolean);
        }

        const oldChats = await FetchPastMessagesFromDbAndCacheThem(user, plan_type);
        if (oldChats?.message) return [];
        return Array.isArray(oldChats) ? oldChats : [];
    } catch (e) {
        console.error("GetChatsForContext error:", e);
        return [];
    }
}