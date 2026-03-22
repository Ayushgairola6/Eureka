import { convertKeysToCamelCase } from "@pinecone-database/pinecone/dist/utils/convertKeys.js";
import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { GetDocumentInfo, GetDocumentInfoFromName } from "./phase1_context.js";
import { extractUUID } from "./phase2_action.js";
import { ToolRegistry } from "./tools.js";

//gets the basic information related the document from the database or cache if available
export async function ProcessDocumentInfoGathering(ReferenceArray, user) {
  const Document_Information = [];
  if (ReferenceArray.length > 0) {
    // Execute all doc fetches in parallel
    await Promise.all(
      ReferenceArray.map(async (req) => {
        const docId = req.arguments.doc_id;
        if (docId) {
          try {
            // Assuming config.execute returns { metadata: {...} }
            const result = await req.config.execute(docId, user);
            if (result && result?.data) {
              Document_Information.push({
                doc_id: docId,
                result: result?.data || result,
              });
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

//gets the conttext from public contributions
export async function ProcessKnowledgeBaseContextGathering(
  ReferenceArray,
  user,
  MetaDataArray
) {
  const Response = [];
  if (ReferenceArray.length > 0) {
    let i = 0;

    await Promise.all(
      ReferenceArray.map(async (req) => {
        try {
          //find the category-subCategory-description of the document from the metadat
          const current = MetaDataArray.find(
            (func) => func.doc_id === extractUUID(req?.arguments?.query) //if the query has the uuid of any document
          );
          let results;
          if (current) {
            results = await req.config.execute(
              current?.result?.metadata?.category || "General",
              current?.result?.metadata?.subCategory || "General",
              current?.result?.metadata?.category || "General",
              user
            );
          }
          //find fetch based on the metadata of other documents
          else if (MetaDataArray.length > 0) {
            let i = 0;
            while (i < MetaDataArray.length) {
              results = results = await req.config.execute(
                MetaDataArray[i].result.metadata.category || "General",
                MetaDataArray[i].result.metadata.subCategory || "General",
                MetaDataArray[i].result.metadata.about,
                user
              );
              i++;
            }
          }
          if (results) {
            Response.push({
              category: current
                ? current?.result?.metadata?.category
                : "unknown",
              subcategory: current
                ? current?.result?.metadata?.subCategory
                : "unknown",
              text: results,
            });
          }

          // console.log(result);
        } catch (error) {
          console.error(
            error,
            "error while fetching info from public sources helper_functions line:82"
          );
        }
      })
    );
  }

  return Response;
}

//helped function to process web results
export async function ProcessWebContextGathering(
  ReferenceArray, //
  user,
  documentInfoArray,
  MessageId,
  plan_type
) {
  const FinalResult = [];
  let AllFavicons = [];
  const FinalFetchRequests = [];
  try {
    for (let i = 0; i < ReferenceArray?.length; i++) {
      let finalQuery = ReferenceArray[i].arguments.query?.trim();

      if (!finalQuery) {
        const targetDoc = documentInfoArray[i] || documentInfoArray[0];

        if (targetDoc?.metadata) {
          finalQuery =
            targetDoc.metadata?.about || JSON.stringify(targetDoc.metadata);
        } else {
          continue;
        }
      }

      FinalFetchRequests.push({
        func: ReferenceArray[i],
        query: finalQuery,
      });
    }

    // 2. Process the requests (Parallel Execution)
    if (FinalFetchRequests.length > 0) {
      await Promise.all(
        FinalFetchRequests.map(async (req) => {
          try {
            const result = await req.func.config.execute(req.query, {
              user,
              plan_type,
              MessageId,
            });

            if (result?.favicons) {
              AllFavicons.push(...result.favicons); // Safe push
            }

            // Only push if we actually got results
            if (result?.FormattedResults) {
              FinalResult.push({
                query: req.query,
                webResults: result.FormattedResults,
              });
            }
          } catch (error) {
            console.error(`Search failed for "${req.query}":`, error.message);
          }
        })
      );
    }

    return { FinalResult, AllFavicons };
  } catch (error) {
    console.error("Web Context Error:", error);
    return []; // Return empty array instead of string for consistency
  }
}
//checking the private document information of the user
export async function CheckPrivateDocs(ReferenceArray, user, DocumentArray) {
  const FinalResult = [];
  await Promise.all(
    ReferenceArray.map(async (req) => {
      const document_id = req.arguments.doc_id;

      if (document_id) {
        const documentQuery = DocumentArray.find(
          (func) => func.doc_id === document_id
        );
        const result = await req.config.execute(
          document_id,
          documentQuery?.result?.metadata?.about,
          user
        ); //user file description as query

        FinalResult.push({ document_id: document_id, context: result });
      } else {
        const documentQuery = DocumentArray[0];
        if (!documentQuery) return; // guard
        const result = await req.config.execute(
          documentQuery.doc_id, // use fallback doc id
          documentQuery?.result?.metadata?.about,
          user
        ); //user file description as query

        if (result && result?.data)
          FinalResult.push({ document_id: document_id, context: result });
      }
    })
  );
  return FinalResult;
}
export async function getSelectedChunks(
  ReferenceArray,
  user,
  question,
  plan_type
) {
  try {
    const SelectedChunks = [];

    await Promise.all(
      ReferenceArray.map(async (func) => {
        if (func && func?.arguments) {
          const doc_id = func.arguments?.doc_id; //the document to find
          const query = func.arguments?.query || question; //the specific query

          if (doc_id && query) {
            const result = await func?.config?.execute(
              doc_id,
              query,
              user,
              plan_type
            );

            if (result && result?.data) {
              SelectedChunks.push({ doc_id, data: result?.data });
            }
          }
        }
      })
    );
    return SelectedChunks;
  } catch (getSelectedChunksError) {
    console.log(`getSelectedChunksError\n`, getSelectedChunksError);
  }
}
//storing any memories for the user
export async function HandleMemoryStorage(user, ReferenceArray) {
  try {
    // const
  } catch (MemoryStorageError) {
    console.error(`Memory storage error\n`, MemoryStorageError);
  }
}

//retrieving any memories from postgrestable
export async function RetrieveOlderMemories(user, ReferenceArray) {
  try {
    const MemoryRetrieval = ReferenceArray?.map((func) => {
      if (func && func.arguments) {
      }
    });
    const { data: memory, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", user?.user_id);

    if (!memory || error) {
      return { error, memory: [] };
    }

    return { error: null, memory };
  } catch (MemoryRetrievalError) {
    console.error(`Memory retreival error\n`, MemoryRetrievalError);
  }
}

//fetch last few messages for reminder whwer we left off
export async function FetchPastMessagesFromDbAndCacheThem(user, plan_type) {
  const limit = plan_type === "free" ? 5 : 10;
  const { data, error } = await supabase
    .from("Conversation_History")
    .select("created_at,question,AI_response")
    .eq("user_id", user.user_id)
    .limit(limit)
    .order("created_at", { ascending: false });

  if (data?.length === 0 || error) {
    return { message: "There is no past conversation history of this user" };
  }

  const chronological = data.reverse();

  if (chronological.length === 0) {
    return [];
  }
  const key = `user_id=${user.user_id}_time=${new Date().toDateString()}`;

  const serialized = chronological.map((msg) => JSON.stringify(msg));
  await redisClient.multi().rPush(key, serialized).expire(key, 5000);
  return data;
}

//summary extractor for room memory
export async function ExtractChatsSummary(
  ReferenceArray,
  room_id,
  user_question
) {
  const results = await Promise.all(
    ReferenceArray.map(async (req) => {
      const query = req.arguments.query || user_question;
      return await req.config.execute(query, room_id);
    })
  );
  return results.filter(Boolean);
}

export async function RetrieveInformatioByName(ReferenceArray, user) {
  const Document_Information = [];

  try {
    if (ReferenceArray.length > 0) {
      // Execute all doc fetches in parallel
      await Promise.all(
        ReferenceArray.map(async (req) => {
          const filename = req?.arguments?.filename;
          //if there is a file name and the file name is of string type
          if (filename && typeof filename === "string") {
            try {
              // Assuming config.execute returns { metadata: {...} }
              const result = await req.config.execute(filename, user);
              if (result && result?.data) {
                Document_Information.push(result); //with the document_id identifier
              }
            } catch (e) {
              console.error(`Failed to fetch doc ${filename}`, e);
            }
          }
        })
      );
    }
    return Document_Information;
  } catch (getByNameError) {
    console.error(`Get document info by name error\n`, getByNameError);
    return Document_Information;
  }
}

// handles the pre process functions requirements that are asked by the model
export async function HandlePreProcessFunctions(
  functionsArray, //array of functions the llm asked for
  user, // the user object
  alreadyFetchedIds //ids that have been fetched already
) {
  if (!functionsArray || !Array.isArray(functionsArray)) {
    return { error: "The funcion list array is empty" };
  }

  const Context = { AlldocumentInformation: [], context_by_uuid: [] }; //the global context object of preprocessing

  try {
    const phase1_Context = [];

    functionsArray.forEach((func) => {
      const config = ToolRegistry[func.function_name];
      if (!config) return;
      if (config.importance === 1) {
        phase1_Context.push({ ...func, config });
      }
    });

    // get doc_data_by name condition
    const doc_data_fromName = await GetDocumentInfoFromName(
      phase1_Context, // to scane the executable function from the toolregistry
      user, //handle the extraction by matching user id
      alreadyFetchedIds || [] //ids of any manually selected documents
    );

    // if some data is retrieved fill it in the array of context
    if (doc_data_fromName.length > 0) {
      // console.log(" data based on name", doc_data_fromName);
      Context.AlldocumentInformation = [
        ...(Context.AlldocumentInformation || []),
        ...(doc_data_fromName || []),
      ];
    }

    //if the models asked for document_by id

    const doc_data = await GetDocumentInfo(
      phase1_Context,
      alreadyFetchedIds,
      user
    );

    if (doc_data && doc_data?.length > 0) {
      // console.log(" data based on id", doc_data);

      Context.context_by_uuid = [...doc_data];
    }

    return Context;
  } catch (preProcessingHandlerError) {
    console.error(`preProcessingHandlerErorr\n`, preProcessingHandlerError);
    return Context;
  }
}
