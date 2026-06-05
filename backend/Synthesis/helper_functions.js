import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { GetDocumentInfo, GetDocumentInfoFromName } from "./phase1_context.js";
import { extractUUID } from "./phase2_action.js";
import { ToolRegistry } from "./tools.js";

export async function ProcessDocumentInfoGathering(ReferenceArray, user) {
  const results = await Promise.all(
    ReferenceArray.map(async ({ arguments: args, config }) => {
      if (!args.doc_id) return null;
      try {
        const result = await config.execute(args.doc_id, user);
        return result?.data ? { doc_id: args.doc_id, result: result.data } : null;
      } catch (e) {
        console.error(`Failed to fetch doc ${args.doc_id}:`, e);
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

export async function ProcessKnowledgeBaseContextGathering(ReferenceArray, user, MetaDataArray) {
  const results = await Promise.all(
    ReferenceArray.map(async ({ arguments: args, config }) => {
      try {
        const matched = MetaDataArray.find((doc) => doc.doc_id === extractUUID(args?.query));
        const ref = matched || MetaDataArray[0];
        if (!ref) return null;

        const result = await config.execute(
          ref.result.metadata.category || "General",
          ref.result.metadata.subCategory || "General",
          matched ? ref.result.metadata.category : ref.result.metadata.about,
          user
        );

        return result
          ? {
            category: ref.result.metadata.category || "unknown",
            subcategory: ref.result.metadata.subCategory || "unknown",
            text: result,
          }
          : null;
      } catch (e) {
        console.error("Knowledge base fetch error:", e);
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

export async function ProcessWebContextGathering(ReferenceArray, user, documentInfoArray, MessageId, plan_type) {
  const FinalResult = [];
  const AllFavicons = [];

  try {
    const requests = ReferenceArray.map((func) => {
      const query = func.arguments.query?.trim() || documentInfoArray[0]?.metadata?.about;
      return query ? { func, query } : null;
    }).filter(Boolean);

    await Promise.all(
      requests.map(async ({ func, query }) => {
        try {
          const result = await func.config.execute(query, { user, plan_type, MessageId });
          if (result?.favicons) AllFavicons.push(...result.favicons);
          if (result?.FormattedResults) FinalResult.push({ query, webResults: result.FormattedResults });
        } catch (e) {
          console.error(`Search failed for "${query}":`, e.message);
        }
      })
    );

    return { FinalResult, AllFavicons };
  } catch (e) {
    console.error("Web Context Error:", e);
    return { FinalResult: [], AllFavicons: [] };
  }
}

export async function CheckPrivateDocs(ReferenceArray, user, DocumentArray) {
  const results = await Promise.all(
    ReferenceArray.map(async ({ arguments: args, config }) => {
      const doc_id = args.doc_id || DocumentArray[0]?.doc_id;
      if (!doc_id) return null;
      const docQuery = DocumentArray.find((d) => d.doc_id === doc_id);
      const result = await config.execute(doc_id, docQuery?.result?.metadata?.about, user);
      return result ? { document_id: doc_id, context: result } : null;
    })
  );
  return results.filter(Boolean);
}

export async function getSelectedChunks(ReferenceArray, user, question, plan_type) {
  try {
    const results = await Promise.all(
      ReferenceArray.map(async (func) => {
        const doc_id = func.arguments?.doc_id;
        const query = func.arguments?.query || question;
        if (!doc_id || !query) return null;
        const result = await func.config.execute(doc_id, query, user, plan_type);
        return result?.data ? { doc_id, data: result.data } : null;
      })
    );
    return results.filter(Boolean);
  } catch (e) {
    console.error("getSelectedChunks error:", e);
    return [];
  }
}

export async function HandleMemoryStorage(user, ReferenceArray) {
  try {
    // TODO: implement memory storage
  } catch (e) {
    console.error("Memory storage error:", e);
  }
}

export async function RetrieveOlderMemories(user) {
  try {
    const { data: memory, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", user.user_id);

    return error ? { error, memory: [] } : { error: null, memory };
  } catch (e) {
    console.error("Memory retrieval error:", e);
  }
}

export async function FetchPastMessagesFromDbAndCacheThem(user, plan_type) {
  const limit = plan_type === "free" ? 5 : 10;
  const { data, error } = await supabase
    .from("Conversation_History")
    .select("created_at,question,AI_response")
    .eq("user_id", user.user_id)
    .limit(limit)
    .order("created_at", { ascending: false });

  if (!data?.length || error) return { message: "No past conversation history" };

  const chronological = data.reverse();
  const key = `user_id=${user.user_id}_time=${new Date().toDateString()}`;
  await redisClient.multi().rPush(key, chronological.map((m) => JSON.stringify(m))).expire(key, 5000);
  return chronological;
}

export async function ExtractChatsSummary(ReferenceArray, room_id, user_question) {
  const results = await Promise.all(
    ReferenceArray.map(({ arguments: args, config }) =>
      config.execute(args.query || user_question, room_id)
    )
  );
  return results.filter(Boolean);
}

export async function RetrieveInformatioByName(ReferenceArray, user) {
  try {
    const results = await Promise.all(
      ReferenceArray.map(async ({ arguments: args, config }) => {
        if (!args.filename || typeof args.filename !== "string") return null;
        try {
          const result = await config.execute(args.filename, user);
          return result?.data ? result : null;
        } catch (e) {
          console.error(`Failed to fetch doc by name "${args.filename}":`, e);
          return null;
        }
      })
    );
    return results.filter(Boolean);
  } catch (e) {
    console.error("RetrieveInformatioByName error:", e);
    return [];
  }
}

export async function HandlePreProcessFunctions(functionsArray, user, alreadyFetchedIds) {
  if (!Array.isArray(functionsArray)) return { error: "Function list is empty" };

  const Context = { AlldocumentInformation: [], context_by_uuid: [] };

  try {
    const phase1_Context = functionsArray
      .map((func) => {
        const config = ToolRegistry[func.function_name];
        return config?.importance === 1 ? { ...func, config } : null;
      })
      .filter(Boolean);

    const doc_data_fromName = await GetDocumentInfoFromName(phase1_Context, user, alreadyFetchedIds || []);
    if (doc_data_fromName.length > 0) Context.AlldocumentInformation = [...doc_data_fromName];

    const doc_data = await GetDocumentInfo(phase1_Context, alreadyFetchedIds, user);
    if (doc_data?.length > 0) Context.context_by_uuid = [...doc_data];

    return Context;
  } catch (e) {
    console.error("HandlePreProcessFunctions error:", e);
    return Context;
  }
}