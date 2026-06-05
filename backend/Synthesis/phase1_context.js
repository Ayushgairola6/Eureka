import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import {
    ExtractChatsSummary,
    ProcessDocumentInfoGathering,
    ProcessKnowledgeBaseContextGathering,
    RetrieveInformatioByName,
} from "./helper_functions.js";
import { extractUUID } from "./phase2_action.js";
import { ToolRegistry } from "./tools.js";

export async function GetDocumentInfo(phase1_Context, selectedDocuments, user, MessageId) {
    const needs_doc_info = phase1_Context.filter((li) => li.function_name === "GetDoc_info");
    const docToolConfig = ToolRegistry["GetDoc_info"];

    if (!needs_doc_info.length && !selectedDocuments?.length) return [];

    const uniqueDocsMap = new Map();

    for (const item of needs_doc_info) {
        const cleanId = extractUUID(item.arguments.doc_id);
        if (cleanId) uniqueDocsMap.set(cleanId, item);
    }

    for (const docId of selectedDocuments || []) {
        if (!uniqueDocsMap.has(docId)) {
            uniqueDocsMap.set(docId, {
                function_name: "GetDoc_info",
                arguments: { doc_id: docId, query: "AUTO" },
                config: docToolConfig,
            });
        }
    }

    const docdata = await ProcessDocumentInfoGathering(Array.from(uniqueDocsMap.values()), user);

    if (docdata.length > 0) {
        EmitEvent(user.user_id, "query_status", {
            MessageId,
            status: { message: "Gathered DocumentInformation", data: ["Gathering document information"] },
        });
        return docdata;
    }
    return [];
}

export async function GetDocumentInfoFromName(phase1_Context, user, documentsToNeglect, MessageId) {
    const nameRequests = phase1_Context.filter((li) => li.function_name === "searchByName");
    if (!nameRequests.length) return [];

    const rawResults = await RetrieveInformatioByName(nameRequests, user);
    if (!rawResults?.length) return [];

    EmitEvent(user.user_id, "query_status", {
        MessageId,
        status: { message: "found-documents-by-name", data: [`Found ${rawResults.length} documents by name`] },
    });

    return rawResults
        .filter((docs) => docs?.data && !documentsToNeglect.includes(docs.data.document_id))
        .map((docs) => ({
            doc_id: docs.data.document_id,
            result: {
                feedback: docs.data.feedback,
                metadata: docs.data.metadata,
            },
        }));
}

export async function GetKnowledgebaseInfo(phase1_Context, GlobalContextObject, user, MessageId) {
    const needs_kb = phase1_Context.filter((li) => li.function_name === "search_knowledge");
    if (!needs_kb.length) return [];

    const PublicKnowledge = await ProcessKnowledgeBaseContextGathering(
        needs_kb,
        user,
        GlobalContextObject.AlldocumentInformation
    );

    if (PublicKnowledge?.length > 0) {
        EmitEvent(user.user_id, "query_status", {
            MessageId,
            status: { message: "Reading public knowledgebase", data: ["Reading public knowledgebase"] },
        });
        return PublicKnowledge;
    }
    return [];
}

export async function Check_ChatRoomSummary(phase2_Action, room_id, user_query) {
    const checkchatSummary = phase2_Action.filter((li) => li.func_name === "Search_InRoomChat");
    if (!checkchatSummary.length) return [];
    const Summary = await ExtractChatsSummary(checkchatSummary, room_id, user_query);
    return Summary || [];
}