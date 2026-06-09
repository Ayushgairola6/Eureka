import {
  fetchSearchResults,
  getAllDocumentTextsForSummary,
  index,
  pc,
} from "../controllers/fileControllers.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { NeoGraphdriver } from "../GraphDb/Neo4j.js";
import {
  FilterUrlForExtraction,
  FormattForLLM,
  GetDataFromSerper,
  ProcessForLLM,
} from "../OnlineSearchHandler/WebCrawler.js";
import { SearchQueryResults } from '../OnlineSearchHandler/WebSearchHandler.js'

export const ToolRegistry = {
  // ------------------------------------------------------------------
  // 1. GetDoc_info – fetch metadata by document_id
  // ------------------------------------------------------------------
  GetDoc_info: {
    description:
      "Fetches the information about a document solely based on the uuid of the document. Name is not processed here.",
    importance: 1,
    execute: async (params) => {
      const { doc_id, user } = params;
      if (!doc_id || typeof doc_id !== "string") {
        return { error: "Invalid arguments: doc_id required", data: null };
      }
      if (!user || !user.user_id) {
        return { error: "User not provided", data: null };
      }
      const { data, error } = await supabase
        .from("Contributions")
        .select("feedback,metadata")
        .eq("document_id", doc_id)
        .eq("user_id", user.user_id)
        .single();
      if (error) {
        return { error: "Document not found in database", data: null };
      }
      return { error: null, data };
    },
  },

  // ------------------------------------------------------------------
  // 2. searchByName – find document by its name/feedback
  // ------------------------------------------------------------------
  searchByName: {
    description:
      "If the user mentions the name of their document instead of document_id, use this to find information about it.",
    importance: 1,
    execute: async (params) => {
      const { document_name, user } = params;
      if (!document_name || typeof document_name !== "string") {
        return { error: "Invalid arguments: document_name required", data: null };
      }
      if (!user || !user.user_id) {
        return { error: "User not provided", data: null };
      }
      const { data, error } = await supabase
        .from("Contributions")
        .select("feedback,metadata,document_id")
        .eq("feedback", document_name)
        .eq("user_id", user.user_id)
        .single();
      if (error) {
        return { error: "Document not found", data: null };
      }
      return { error: null, data };
    },
  },

  // ------------------------------------------------------------------
  // 3. search_knowledge – public knowledgebase retrieval
  // ------------------------------------------------------------------
  search_knowledge: {
    description:
      "Fetches relevant public knowledge base chunks for the query and category.",
    importance: 1,
    execute: async (params) => {
      const { category, subCategory, question, plan } = params;
      if (!category || !subCategory || !question) {
        return { error: "Missing category, subCategory, or question" };
      }

      const topK = plan !== "free" ? 5 : 2;
      const response = await index.searchRecords({
        query: {
          topK,
          inputs: { text: question },
          filter: {
            category: { $eq: category },
            subCategory: { $eq: subCategory },
            visibility: { $eq: "Public" },
          },
        },
        fields: ["text"],
      });

      if (!response.result.hits?.length) {
        return { error: null, data: "No info in knowledge-base regarding this query" };
      }

      const resultString = response.result.hits
        .map((h) => `score=${h._score}&text=${h.fields.text}`)
        .join("\n");
      return { error: null, data: resultString };
    },
  },

  // ------------------------------------------------------------------
  // 4. store_memory – store key-value memory in graph DB
  // ------------------------------------------------------------------
  store_memory: {
    description:
      "Stores the memory of user in key value and relation format in graph databases for memory creation.",
    importance: 2,
    execute: async (params) => {
      const { memory, user } = params;
      if (!memory || !user) {
        return { error: "Invalid arguments: memory and user required" };
      }
      // Placeholder – implement actual Neo4j logic here
      return { error: null, data: "Memory stored successfully" };
    },
  },

  // ------------------------------------------------------------------
  // 5. get_memory – recall user memory from graph DB
  // ------------------------------------------------------------------
  get_memory: {
    description:
      "Finds any matching memory from the db to generate specific answers.",
    importance: 2,
    execute: async (params) => {
      const { memory, user } = params;
      if (!memory || !user) {
        return { error: "Invalid arguments: memory and user required" };
      }
      // Placeholder – implement actual Neo4j logic here
      return { error: null, data: "No relevant memory found" };
    },
  },

  // ------------------------------------------------------------------
  // 6. get_all_chunks – fetch all chunks of a document by ID
  // ------------------------------------------------------------------
  get_all_chunks: {
    description: "Retrieves all text chunks of a document by its docId.",
    importance: 2,
    execute: async (params) => {
      const { docId, user } = params;
      if (!docId || typeof docId !== "string") {
        return { error: "Invalid docId", data: null };
      }

      const { data, error } = await supabase
        .from("Contributions")
        .select("chunk_count")
        .eq("document_id", docId)
        .single();

      if (error || !data) {
        return { error: `Document ${docId} not found`, data: null };
      }

      const response = await getAllDocumentTextsForSummary(
        docId,
        data.chunk_count
      );

      if (!response || response.length === 0) {
        return { error: "No chunks found for document", data: null };
      }

      const resultString =
        `Following are the chunks related to the document ${docId}:\n` +
        response.join("\n");
      return { error: null, data: resultString };
    },
  },

  // ------------------------------------------------------------------
  // 7. get_selected_chunks – fetch only relevant chunks via vector search
  // ------------------------------------------------------------------
  get_selected_chunks: {
    description:
      "Finds the most relevant chunks of a private document using vector search.",
    importance: 2,
    execute: async (params) => {
      const { docId, question, user, plan } = params;
      if (!docId || !question) {
        return { error: "docId and question are required", data: null };
      }
      const topK = plan !== "free" ? 100 : 50;
      const response = await index.searchRecords({
        query: {
          topK,
          inputs: { text: question },
          filter: {
            documentId: { $eq: docId },
            visibility: { $eq: "Private" },
            contributor: { $eq: user.user_id },
          },
        },
        fields: ["text"],
      });

      if (!response.result.hits?.length) {
        return { error: null, data: "No relevant chunks found" };
      }

      const resultString = response.result.hits
        .map((h) => `score=${h._score}&text=${h.fields.text}`)
        .join("\n");
      return { error: null, data: resultString };
    },
  },

  // ------------------------------------------------------------------
  // 8. search_web – perform a web search and return formatted results
  // ------------------------------------------------------------------
  search_web: {
    description: "Search the web for real-time information.",
    importance: 2,
    execute: async (params) => {
      const { query, user, plan, MessageId } = params;
      if (!query || !user || !plan || !MessageId) {
        return {
          error: "Missing query, user, plan_type, or MessageId",
          FormattedResults: null,
          favicons: [],
        };
      }

      // const { response, links: LinksToFetch } = await fetchSearchResults(
      //   plan,
      //   query,
      //   user,
      //   MessageId
      // );

      // if (!response || !LinksToFetch?.length) {
      //   return {
      //     error: "Web search returned no results",
      //     FormattedResults: null,
      //     favicons: [],
      //   };
      // }

      // const CleanedWebData = await ProcessForLLM(
      //   LinksToFetch.slice(0, 2),
      //   user,
      //   query,
      //   MessageId,
      //   null,
      //   plan
      // );

      // if (!CleanedWebData?.length) {
      //   return {
      //     error: "Web search failed to extract content",
      //     FormattedResults: null,
      //     favicons: [],
      //   };
      // }

      // const WebResults = FormattForLLM(CleanedWebData);
      // if (WebResults?.error || !WebResults.FinalContent?.length) {
      //   return {
      //     error: WebResults?.error || "Web search formatting failed",
      //     FormattedResults: null,
      //     favicons: [],
      //   };
      // }
      try {
        const { response, favicon } = await SearchQueryResults(query, plan);

        return {
          error: null,
          FormattedResults: response,
          favicons: favicon || [],
        };
      } catch (error) {
        return {
          error: error, FormattedResults: null, favicons: []
        }
      }

    },
  },

  // ------------------------------------------------------------------
  // 9. Search_InRoomChat – search room chat history
  // ------------------------------------------------------------------
  Search_InRoomChat: {
    description:
      "In a room, recall past conversation snippets related to a query.",
    importance: 2,
    execute: async (params) => {
      const { query, room_id } = params;
      if (!query || !room_id) {
        return { error: "query and room_id are required" };
      }

      const chatIndex = pc.index("room_chat_history");
      const history = await chatIndex.searchRecords({
        query: {
          inputs: { text: query, room_id },
          topK: 4,
        },
        fields: ["summary", "created_at"],
      });

      if (!history.result.hits?.length) {
        return { error: null, data: "Unable to find requested history in the records" };
      }

      const resultString = history.result.hits
        .map((h) => `score=${h._score}&summary=${h.fields.summary}&created_at=${h.fields.created_at}`)
        .join("\n");
      return { error: null, data: resultString };
    },
  },

  // ------------------------------------------------------------------
  // 10. get_session_chat – retrieve solo chat history
  // ------------------------------------------------------------------
  get_session_chat: {
    description: "Retrieve solo session chat history for quick recall.",
    importance: 2,
    execute: async (params) => {
      const { room_id } = params;
      if (!room_id) {
        return { error: "room_id is required" };
      }

      const chatIndex = pc.index("room_chat_history");
      // Note: the original code had a missing query variable; using a default empty string.
      const history = await chatIndex.searchRecords({
        query: {
          inputs: { text: "", room_id },
          topK: 4,
        },
        fields: ["summary", "created_at"],
      });

      if (!history.result.hits?.length) {
        return { error: null, data: "No session chat history found" };
      }

      const resultString = history.result.hits
        .map((h) => `score=${h._score}&summary=${h.fields.summary}&created_at=${h.fields.created_at}`)
        .join("\n");
      return { error: null, data: resultString };
    },
  },
};