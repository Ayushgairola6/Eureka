import {
  getAllDocumentTextsForSummary,
  index,
  pc,
} from "../controllers/fileControllers.js";
import { supabase } from "../controllers/supabaseHandler.js";
import { NeoGraphdriver } from "../GraphDb/Neo4j.js";
import {
  SearchQueryResults,
  formatForGemini,
} from "../OnlineSearchHandler/WebSearchHandler.js";

//handles the tools and their function execution
export const ToolRegistry = {
  GetDoc_info: {
    description:
      "Fetches the information about a document solely based on the uuid of the document name is not processed here",
    importance: 1,
    execute: async (doc_id, user) => {
      if (!doc_id || typeof doc_id !== "string") {
        return { message: "Invalid arguments" };
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
          data: "",
        };
      }
      return data; //data includes, category, subcategory,and titile of the file written by the user
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

      // 3. Await the final query
      const { data, error } = await query;
      if (error) {
        console.error(error);
        return {
          message: "There is not such document in the db found",
          data: "",
        };
      }
      return data; //data includes, category, subcategory,and titile of the file written by the user
    },
  },
  search_knowledge: {
    description:
      "Fetches the important stuff related to the query asked by the user and the category they chose",
    importance: 1,
    execute: async (category, subCategory, question, user) => {
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
          topK: user.PaymentStatus === true ? 5 : 2,
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
    execute: async (key, relation, value, user) => {
      if (
        !key ||
        typeof key !== "string" ||
        !value ||
        typeof value !== "string" ||
        !user
      ) {
        return { message: "Invalid arguments" };
      }

      let { records, summary } = await NeoGraphdriver.executeQuery(
        `
  MERGE (u:User {user_id: $user_id})
SET u.name = $username

2. Archive the OLD status: Match the current active relationship
// Use relationship property 'key' to find the same subject regardless of the relation type
OPTIONAL MATCH (u)-[r]->(old_m:Memory)
WHERE type(r) = $relationType AND r.key = $key AND r.status = 'CURRENT'
SET r.status = 'HISTORY', 
    r.end_date = timestamp()

// 3. Create the NEW Memory Node
CREATE (new_m:Memory {
    key: $key, 
    value: $value, 
    created_at: timestamp()
})

// 4. Create a new relationship with the dynamic type
// NOTE: $relationType must be safely inserted into the query string by your server code.
CREATE (u)-[:$relationType {key: $key, status: 'CURRENT', start_date: timestamp()}]->(new_m)

RETURN new_m

  
  `,
        { user_id: user.user_id, name: user.username },
        { database: process.env.NEO4J_DATABASE }
      );
      // console.log(
      //   `Created ${summary.counters.updates().nodesCreated} nodes ` +
      //     `in ${summary.resultAvailableAfter} ms.`
      // );
      return "Created a new memory";
    },
  },
  get_memory: {
    description:
      "Finds any matchin memory from the graph to generate specific answers",
    importance: 2,
    execute: async (user, relation, value) => {
      if (
        !key ||
        typeof key !== "string" ||
        !value ||
        typeof value !== "string" ||
        !user
      ) {
        return { message: "Invalid arguments" };
      }

      let { records, summary } = await NeoGraphdriver.executeQuery(
        `
  MERGE (u:User {user_id: $user_id})
SET u.name = $username

2. Archive the OLD status: Match the current active relationship
// Use relationship property 'key' to find the same subject regardless of the relation type
OPTIONAL MATCH (u)-[r]->(old_m:Memory)
WHERE type(r) = $relationType AND r.key = $key AND r.status = 'CURRENT'
SET r.status = 'HISTORY', 
    r.end_date = timestamp()

// 3. Create the NEW Memory Node
CREATE (new_m:Memory {
    key: $key, 
    value: $value, 
    created_at: timestamp()
})

// 4. Create a new relationship with the dynamic type
// NOTE: $relationType must be safely inserted into the query string by your server code.
CREATE (u)-[:$relationType {key: $key, status: 'CURRENT', start_date: timestamp()}]->(new_m)

RETURN new_m

  
  `,
        { user_id: user.user_id, name: user.username },
        { database: process.env.NEO4J_DATABASE }
      );
      console.log(
        `Created ${summary.counters.updates().nodesCreated} nodes ` +
          `in ${summary.resultAvailableAfter} ms.`
      );
      return records;
    },
  },
  ask_private: {
    description:
      "Find the data of a document whose document id is available to us",
    importance: 2,
    execute: async (docId, question, user) => {
      if (!question || typeof question !== "string") {
        return { message: "Invalid arguments" };
      }

      //getting the text chunks from the db
      // const response = await index.searchRecords({
      //   query: {
      //     topK: user.PaymentStatus === true ? 20 : 10,
      //     inputs: { text: question },
      //     filter: {
      //       documentId: { $eq: docId },
      //       visibility: { $eq: "Private" },
      //       contributor: { $eq: user.user_id },
      //     },
      //   },
      //   fields: ["text"], //only return the text
      // });

      // if (response.result.hits.length < 0) {
      //   return `No info in knowledge-base regard this query`;
      // }
      const { data, error } = await supabase
        .from("Contributions")
        .select("  chunk_count ")
        .eq("document_id", docId);

      if (error) {
        return `An error occured while finding the information of document=${docId}`;
      }
      const response = await getAllDocumentTextsForSummary(
        docId,
        data[0].chunk_count
      );

      if (!response || response.length === 0) {
        return `An error occured while finding the information of document=${docId}`;
      }
      let ResultString = `Following are the chunks related to the document=${docId} from memory=`;
      response.forEach((str) => {
        ResultString += str; //append the context values
      });

      return ResultString;
    },
  },
  search_web: {
    description:
      "Find the data of a document whose document id is available to us",
    importance: 2,
    execute: async (query, user) => {
      if (!query || typeof query !== "string") {
        return { message: "Invalid arguments" };
      }

      // getting the text chunks from the db
      let favicons = [];
      const webResults = await SearchQueryResults(query, user.PaymentStatus); //web results

      if (webResults.error) {
        return "No web results found";
      }

      favicons = [...webResults.favicon]; //favicon of current results
      const FormattedResults = await formatForGemini(webResults.response);

      if (!FormattedResults) {
        return "Unable to find any information regarding the user query from the web";
      }
      // const FormattedResults = "These are the web results";
      // console.log("These are web search results", FormattedResults);
      return { FormattedResults, favicons };
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
};
