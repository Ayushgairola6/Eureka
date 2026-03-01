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

//handles the tools and their function execution
export const ToolRegistry = {
  GetDoc_info: {
    description:
      "Fetches the information about a document solely based on the uuid of the document name is not processed here",
    importance: 1,
    execute: async (doc_id, user) => {
      if (!doc_id || typeof doc_id !== "string") {
        return { message: "Invalid arguments", data: null };
      }
      // const results = await
      const { data, error } = await supabase
        .from("Contributions")
        .select("feedback,metadata")
        .eq("document_id", doc_id)
        .eq("user_id", user.user_id)
        .single();
      if (error) {
        return {
          message: "There is not such document in the db found",
          data: null,
        };
      }
      return { message: "Data of the file foung", data: data };
    },
  },
  searchByName: {
    description:
      "If the user mentions the name of their document instead of document_id uses this method to find information about document ",
    importance: 1,
    execute: async (document_name, user) => {
      const query = supabase
        .from("Contributions")
        .select("feedback,metadata,document_id")
        .eq("feedback", document_name)
        .eq("user_id", user.user_id)
        .single();

      const { data, error } = await query;
      if (error) {
        console.error(error);
        return {
          message: "There is not such document in the db found",
          data: null,
        };
      }
      return { message: "document data found", data: data }; //data includes, category, subcategory,and titile of the file written by the user
    },
  },
  search_knowledge: {
    description:
      "Fetches the important stuff related to the query asked by the user and the category they chose",
    importance: 1,
    execute: async (category, subCategory, question, user, plan_type) => {
      if (
        !category ||
        typeof category !== "string" ||
        !subCategory ||
        typeof subCategory !== "string" ||
        !question ||
        typeof question !== "string"
      ) {
        return { message: "Invalid arguments" };
      }

      //getting the text chunks from the db
      const response = await index.searchRecords({
        query: {
          topK: plan_type !== "free" ? 5 : 2,
          inputs: { text: question },
          filter: {
            category: { $eq: category },
            subCategory: { $eq: subCategory },
            visibility: { $eq: "Public" },
          },
        },
        fields: ["text"], //only return the text
      });

      if (response.result.hits.length < 0) {
        return `No info in knowledge-base regard this query`;
      }

      //build the string
      let ResultString = ``;
      response.result.hits.forEach((li) => {
        ResultString += `score=${li._score}&text=${li.fields.text}`;
      });

      // console.log(ResultString, "The knowledgebaseInfo");
      return ResultString;
    },
  },
  store_memory: {
    description:
      "Stores the memory of user in key value and relation format in graph databases for memory creation",
    importance: 2,
    execute: async (memory, user) => {
      if (!memory || !user) {
        return { message: "Invalid arguments" };
      }
    },
  },
  get_memory: {
    description:
      "Finds any matchin memory from the db to generate specific answers",
    importance: 2,
    execute: async (memory, user) => {
      if (!memory || !user) {
        return { message: "Invalid arguments" };
      }
    },
  },
  get_all_chunks: {
    description:
      "Find the data of a document whose document id is available to us",
    importance: 2,
    execute: async (docId, question, user) => {
      if (
        !question ||
        typeof question !== "string" ||
        !docId ||
        typeof docId !== "string"
      ) {
        return { error: "Invalid arguments", data: null };
      }

      const { data, error } = await supabase
        .from("Contributions")
        .select("  chunk_count ")
        .eq("document_id", docId);

      if (error) {
        return {
          error: `An error occured while finding the information of document=${docId}`,
          data: null,
        };
      }
      const response = await getAllDocumentTextsForSummary(
        docId,
        data[0].chunk_count
      );

      if (!response || response.length === 0) {
        return {
          error: `An error occured while finding the information of document=${docId}`,
          data: null,
        };
      }
      let ResultString = `Following are the chunks related to the document=${docId} from memory=`;
      response.forEach((str) => {
        ResultString += str; //append the context values
      });

      return { error: null, data: ResultString };
    },
  },
  get_selected_chunks: {
    description:
      "Find the data of a document whose document id is available to us",
    importance: 2,
    execute: async (docId, question, user, plan_type) => {
      if (
        !question ||
        typeof question !== "string" ||
        !docId ||
        typeof docId !== "string"
      ) {
        return { error: "Invalid arguments", data: null };
      }

      // getting the text chunks from the db
      const response = await index.searchRecords({
        query: {
          topK: plan_type !== "free" ? 100 : 50,
          inputs: { text: question },
          filter: {
            documentId: { $eq: docId },
            visibility: { $eq: "Private" },
            contributor: { $eq: user.user_id },
          },
        },
        fields: ["text"], //only return the text
      });

      if (response.result.hits.length < 0) {
        return {
          error: null,
          data: `No info in knowledge-base regard this query`,
        };
      }
      let ResultString = "";

      response.result.hits.forEach((e) => {
        if (e.fields.text) {
          ResultString += `score=${e._score}&text=${e.fields.text}`;
        }
      });
      return { error: null, data: ResultString };
    },
  },
  search_web: {
    description: "Search the web for real-time information",
    importance: 2,
    execute: async (question, data) => {
      if (!question || typeof question !== "string") {
        return {
          FormattedResults: "Some error occured in the web seach handler.",
          favicons: [],
        };
      }

      const { user, plan_type, MessageId } = data;
      if (!user || !plan_type || !MessageId) {
        return {
          FormattedResults: "Some error occured in the web seach handler.",
          favicons: [],
        };
      }
      // fetch relevant links from the seper
      const { response, links: LinksToFetch } = await fetchSearchResults(
        plan_type,
        question,
        user,
        MessageId
      );

      if (!response || LinksToFetch?.length === 0) {
        return {
          FormattedResults: "Some error occured in the web seach handler.",
          favicons: [],
        };
      }

      // scrape and optimize the context for the llm
      const CleanedWebData = await ProcessForLLM(
        LinksToFetch,
        user,
        question,
        MessageId,
        null,
        plan_type
      );
      // extract only necessary chunks for context

      if (CleanedWebData.length === 0) {
        // console.log(CleanedWebData, "The cleanedWebData ");
        return {
          FormattedResults: "Some error occured in the web seach handler.",
          favicons: [],
        };
      }

      //Foramt for llm
      const WebResults = FormattForLLM(CleanedWebData);

      if (WebResults?.error || WebResults.FinalContent.length === 0) {
        // console.log(WebResults, "The WebResults ");

        return {
          FormattedResults: "Some error occured in the web seach handler.",
          favicons: [],
        };
      }

      return {
        FormattedResults: WebResults?.FinalContent,
        favicons: WebResults.favicons,
      };
    },
  },
  Search_InRoomChat: {
    description:
      "In a room if a past memory is recalled this method is called for a hazy memory effect",
    importance: 2,
    execute: async (query, room_id) => {
      if (!query || typeof query !== "string") {
        return { message: "Invalid arguments" };
      }
      const chatIndex = await pc.index("room_chat_history");

      //find the most matching messages
      const history = await chatIndex.searchRecords({
        query: {
          inputs: { text: query, room_id: room_id },
          topK: 4,
        },
        fields: ["summary", "created_at"],
      });

      let summaryString = "";
      if (history.result.hits.length > 0) {
        history.result.hits.forEach((sum) => {
          summaryString += `score=${sum._score}&summary=${sum.fields.summary}&create_at=${sum.fields.created_at}`;
        });

        return summaryString;
      }

      return "Unable to find requested history in the records";
      // getting the text chunks from the db
    },
  },
  get_session_chat: {
    description: "To retrive solo session chat history for quick recall",
    importance: 2,
    execute: async (room_id) => {
      if (!room_id) {
        return { message: "Invalid arguments" };
      }
      const chatIndex = await pc.index("room_chat_history");

      //find the most matching messages
      const history = await chatIndex.searchRecords({
        query: {
          inputs: { text: query, room_id: room_id },
          topK: 4,
        },
        fields: ["summary", "created_at"],
      });

      let summaryString = "";
      if (history.result.hits.length > 0) {
        history.result.hits.forEach((sum) => {
          summaryString += `score=${sum._score}&summary=${sum.fields.summary}&create_at=${sum.fields.created_at}`;
        });

        return summaryString;
      }

      return "Unable to find requested history in the records";
      // getting the text chunks from the db
    },
  },
};
