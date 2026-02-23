import { domainToASCII } from "url";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import {
  ProcessDocumentInfoGathering,
  ProcessKnowledgeBaseContextGathering,
  RetrieveInformatioByName,
} from "./helper_functions.js";
import { extractUUID } from "./phase2_action.js";
import { ToolRegistry } from "./tools.js";

//extract the document information if the user has asked for it
export async function GetDocumentInfo(
  phase1_Context,
  selectedDocuments,
  user,
  MessageId
) {
  const needs_doc_info = phase1_Context.filter(
    (li) => li.function_name === "GetDoc_info"
  );

  //get the conif object of the function from toolRegistery
  const docToolConfig = ToolRegistry["GetDoc_info"];

  //if there is need to look for idocment information
  if (needs_doc_info?.length > 0 || selectedDocuments?.length > 0) {
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

    //send it to the helper function

    const docdata = await ProcessDocumentInfoGathering(
      FinalizedDocuments,
      user
    );

    // --- 5. Update Global Context ---
    if (docdata.length > 0) {
      EmitEvent(user.user_id, "query_status", {
        MessageId,
        status: {
          message: "Gathered DocumentInformation",
          data: [`Gathering document information ${JSON.stringify(docdata)}`],
        },
      });

      return docdata; //an array of information
    } else {
      return {}; //empty array to avoid infinite stuck loop or error
    }
  }
}

export async function GetDocumentInfoFromName(
  phase1_Context,
  user,
  documentsToNeglect,
  MessageId // Default to empty array
) {
  // 1. Identify "searchByName" requests
  const nameRequests = phase1_Context.filter(
    (li) => li.function_name === "searchByName"
  );

  //if there are no values
  if (!nameRequests || nameRequests.length === 0) {
    return [];
  }

  // OR handles the filtering internally.
  const rawResults = await RetrieveInformatioByName(nameRequests, user);

  // 4. Critical Step: Deduplication

  //store only valid non duplicate documents
  if (rawResults && rawResults.length > 0) {
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: "found-documents-by-name",
        data: [`Found ${rawResults.length} documents by name`],
      },
    });

    const FinalArray = [];
    for (const docs of rawResults) {
      // if this is a different document
      if (!documentsToNeglect.includes(docs.doc_id)) {
        FinalArray.push({
          doc_id: docs.document_id,
          result: { feedback: docs.feedback, metadata: docs.metadata },
        });
      }
    }

    return FinalArray;
  }

  return [];
}
//extract information from the public knowledge base with same metadata as the documents selected
export async function GetKnowledgebaseInfo(
  phase1_Context,
  GlobalContextObject,
  user,
  MessageId
) {
  const needs_to_search_knowledgebase = phase1_Context.filter(
    (li) => li.function_name === "search_knowledge"
  );

  //if there are
  if (needs_to_search_knowledgebase.length > 0) {
    const PublicKnowledge = await ProcessKnowledgeBaseContextGathering(
      needs_to_search_knowledgebase,
      user,
      GlobalContextObject.AlldocumentInformation
    );

    if (PublicKnowledge && PublicKnowledge.length > 0) {
      EmitEvent(user.user_id, "query_status", {
        MessageId,
        status: {
          message: `Reading public knowledgebase`,
          data: [
            `Reading public knowledgebase:${PublicKnowledge[0]?.text?.slice(
              0,
              50
            )}`,
          ],
        },
      });

      return PublicKnowledge; //array of object shape information
    }
  }
  return [];
}

//if the model wants to check something in the summary history for informatin
export async function Check_ChatRoomSummary(phase2_Action) {
  //if the request is for a room chatHistory retrieval
  const checkchatSummmary = phase2_Action.filter(
    (li) => li.func_name === "Search_InRoomChat"
  );

  if (checkchatSummmary.length > 0) {
    const Summary = await ExtractChatsSummary(
      checkchatSummmary,
      room_id,
      user_query
    );

    if (Summary) {
      GlobalContextObject.room_chat_summary = [Summary];
    }
  }
  return [];
}

// function to filter out duplicate documents_based on ids
function FilterIds(GetDoc_info, SelectedDocuments) {
  //if there is need to look for idocment information
  const uniqueDocsMap = new Map();

  if (GetDoc_info.length > 0 || SelectedDocuments.length > 0) {
    for (const item of GetDoc_info) {
      const docId = item.arguments.doc_id; //from arguments only pick those who have a uuid
      const cleanId = extractUUID(docId); //clean the docuement_ID
      if (cleanId) {
        uniqueDocsMap.set(docId, docId);
      }
    }

    //extract document_ids from the manually selected document_id's
    for (const docId of SelectedDocuments) {
      if (!uniqueDocsMap.has(docId)) {
        uniqueDocsMap.set(docId, docId);
      }
    }
  }

  const FinalizedDocuments = Array.from(uniqueDocsMap.values());
  return FinalizedDocuments;
}
