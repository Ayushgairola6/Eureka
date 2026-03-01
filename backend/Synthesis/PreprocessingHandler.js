import { supabase } from "../controllers/supabaseHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { IDENTIFIER_PROMPT } from "../Prompts/Prompts.js";
import { HandlePreProcessFunctions } from "./helper_functions.js";
import {
  CentralFunctionProcessor,
  ExeCuteContextEngines,
} from "./Identifier.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
import { IdentifyUserRequest } from "../controllers/ModelController.js";
import { redisClient } from "../CachingHandler/redisClient.js";

//fetches the metadata of the document from the db for synthesis mode

export const HandleDocumentMetadataGathering = async (
  selectedDocuments,
  user
) => {
  // check for data metadata and title in the cache all of em.
  const cacheResults = await Promise.all(
    selectedDocuments
      .filter(Boolean) // remove falsy ids upfront
      .map(async (id) => {
        try {
          const key = `doc:${id}`;
          const cached = await redisClient.hGetAll(key);

          if (cached && Object.keys(cached).length > 0) {
            return { id, data: cached, fromCache: true };
          }
          return { id, data: null, fromCache: false };
        } catch (err) {
          console.error(`Cache read failed for ${id}`, err);
          return { id, data: null, fromCache: false }; // fallback to DB
        }
      })
  );

  // filter out the hits and misses from the cache
  const hits = cacheResults.filter((r) => r.fromCache);
  const misses = cacheResults.filter((r) => !r.fromCache);

  let dbResults = [];
  // if there are any misses get them from the db
  if (misses.length > 0) {
    const missIds = misses.map((r) => r.id);

    const { data, error } = await supabase
      .from("Contributions")
      .select("document_id, feedback, metadata")
      .in("document_id", missIds) // single query not N queries
      .eq("user_id", user.user_id);

    if (!error && data) {
      dbResults = data;

      // cache the missed document info
      const pipeline = redisClient.multi();

      data.forEach((doc) => {
        const key = `doc:${doc.document_id}`;
        pipeline.hSet(key, {
          document_id: doc.document_id,
          feedback: doc.feedback || "",
          metadata: JSON.stringify(doc.metadata || {}),
        });
        pipeline.expire(key, 60 * 60 * 5); // 5 hours
      });

      await pipeline.exec();
    }
  }

  //merge the cache hits and db results;
  const allResults = [
    ...hits.map((h) => ({
      document_id: h.id,
      feedback: h.data.feedback,
      metadata: JSON.parse(h.data.metadata || "{}"),
    })),
    ...dbResults,
  ];

  return allResults; //return all of them
};

// checks if the llms is asking for more or just doing things in one go

export async function SynthsisOrchrestrator(data, iterator = 0) {
  try {
    const { user, MessageId, context, selectedDocuments, question, plan_type } =
      data;

    if (iterator >= 4) {
      return {
        error: "Max iterations reached",
        answer: null,
        functions: null,
        favicon: { MessageId, icon: [] },
      };
    }

    const responseText = await IdentifyUserRequest(context, IDENTIFIER_PROMPT);

    if (!responseText || responseText?.error) {
      return {
        error: "LLM failed",
        answer: null,
        functions: null,
        favicon: { MessageId, icon: [] },
      };
    }

    const ExtractedFunctions = CentralFunctionProcessor(
      responseText,
      user,
      MessageId
    );

    // model answered directly - no tools needed
    if (ExtractedFunctions?.message) {
      return {
        error: null,
        answer: ExtractedFunctions.message,
        functions: null,
        favicon: { MessageId, icon: [] },
      };
    }

    if (ExtractedFunctions?.error) {
      return {
        error: ExtractedFunctions.error,
        answer: null,
        functions: null,
        favicon: { MessageId, icon: [] },
      };
    }

    // low confidence - needs more context before answering
    if (ExtractedFunctions.confidence === "low") {
      const contextResult = await ExeCuteContextEngines(
        ExtractedFunctions,
        user,
        selectedDocuments,
        MessageId,
        question,
        plan_type
      );

      if (!contextResult?.GlobalContextObject || contextResult?.error) {
        return {
          error: "Context gathering failed",
          answer: null,
          functions: null,
          favicon: { MessageId, icon: [] },
        };
      }

      // enrich context and retry
      const NewContext =
        context +
        `&previous-request=${JSON.stringify(
          ExtractedFunctions.PreProcessFunctions
        )}` +
        `&previous-request-data=${JSON.stringify(
          contextResult.GlobalContextObject
        )}`;

      await new Promise((r) => setTimeout(r, 2000));

      return SynthsisOrchrestrator(
        { user, MessageId, context: NewContext, selectedDocuments },
        iterator + 1
      );
    }

    // high confidence - has all context, execute and return
    if (ExtractedFunctions.confidence === "high") {
      // if no functions needed - model already answered directly
      if (!ExtractedFunctions.PreProcessFunctions?.length) {
        return {
          error: "No functions but no answer either",
          answer: null,
          functions: null,
          favicon: { MessageId, icon: [] },
        };
      }

      const smartExecResult = await ExeCuteContextEngines(
        ExtractedFunctions,
        user,
        selectedDocuments,
        MessageId,
        question,
        plan_type
      );

      if (!smartExecResult?.GlobalContextObject || smartExecResult?.error) {
        return {
          error: "Execution failed",
          answer: null,
          functions: null,
          favicon: { MessageId, icon: [] },
        };
      }

      // feed gathered context back to model for final answer
      const NewContext =
        context +
        `&previous-request=${JSON.stringify(
          ExtractedFunctions.PreProcessFunctions
        )}` +
        `&gathered-context=${JSON.stringify(
          smartExecResult.GlobalContextObject
        )}`;

      await new Promise((r) => setTimeout(r, 2000));

      // recurse with enriched context - model will now have data to answer
      return SynthsisOrchrestrator(
        { user, MessageId, context: NewContext, selectedDocuments },
        iterator + 1
      );
    }

    return {
      error: "Unknown confidence state",
      answer: null,
      functions: null,
      favicon: { MessageId, icon: [] },
    };
  } catch (err) {
    console.error(`[ORCH] ERROR:`, err);
    notifyMe(`SynthesisOrchestrator error\n`, err);
    return {
      error: "Orchestration error",
      answer: null,
      functions: null,
      favicon: { MessageId, icon: [] },
    };
  }
}
