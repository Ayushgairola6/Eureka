import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GenerateResponse } from "./ModelController.js";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabaseHandler.js";
import { CheckFileTypeAndParseIt } from "../FilerParsers/FilerParser.js";
dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_DB_API_KEY,
});

export const index = pc.index("knowledge-base-index");

export const FileUploadHandle = async (req, res) => {
  try {
    const { category, name, feedback, subCategory, visibility } = req.body;
    const file = req.file;
    const userid = req.user.user_id;
    if (!userid) {
      return res.status(400).json({ message: "Please Login to continue ." });
    }
    const email = req.user.email;
    if (
      !category ||
      typeof category !== "string" ||
      !name ||
      typeof name !== "string" ||
      typeof name !== "string" ||
      typeof feedback !== "string" ||
      !feedback ||
      !email ||
      !file ||
      !subCategory ||
      typeof subCategory !== "string" ||
      !visibility
    ) {
      return res.status(400).json({ message: "Invalid data type !" });
    }
    const documentId = uuidv4();

    const CheckedFileType = await CheckFileTypeAndParseIt(file);
    const textChunks = await splitTextIntoChunks(CheckedFileType);

    if (!textChunks || textChunks.length === 0) {
      return res
        .status(400)
        .json({ message: "Error while processing your file" });
    }
    // random id for the doc
    let chunkNumber;
    // array to store a unique record array for upsert operation
    const recordsToUpsert = [];
    // the size of one batch that we process
    const batchSize = 90; // Adjust batch size based on your index type and data size

    // loop to start pushing chunks into the db
    for (let i = 0; i < textChunks.length; i++) {
      // Generate a unique ID for each chunk
      // Option 1: documentId-chunkIndex (simple)
      chunkNumber = i;
      const chunkId = `${documentId.trim()}:${name.trim()}:${feedback.trim()}:${chunkNumber}`;

      // pushing the chunk data in formatted way to store in the db
      recordsToUpsert.push({
        id: chunkId,
        text: textChunks[i],
        visibility: visibility,
        category: category,
        subCategory: subCategory,
        date_of_contribution: new Date().toISOString(),
        documentId: documentId,
        contributor: name,
      });

      // If batch is full or it's the last chunk, upsert the batch
      if (recordsToUpsert.length === batchSize || i === textChunks.length - 1) {
        try {
          await index.upsertRecords(recordsToUpsert); // Pass the array of records
          // console.log(`Upserted batch of ${recordsToUpsert.length} records.`);
          recordsToUpsert.length = 0; // Clear the batch array
        } catch (error) {
          console.error("Error during batch upsert:", error);
          // Implement more specific error handling if needed
          return res
            .status(500)
            .json({ message: "Error during Pinecone upsert operation." });
        }
      }
    }

    // If there are any remaining records after the loop (e.g., if total records not divisible by batchSize)
    if (recordsToUpsert.length > 0) {
      try {
        await index.upsertRecords(recordsToUpsert);
        // console.log(`Upserted final batch of ${recordsToUpsert.length} records.`);
      } catch (error) {
        console.error("Error during final batch upsert:", error);
        return res
          .status(500)
          .json({ message: "Error during Pinecone upsert operation." });
      }
    }
    const StoredContribution = await StoreContributionDetails(
      name,
      email,
      feedback,
      userid,
      visibility,
      documentId,
      chunkNumber
    );

    if (StoredContribution?.error) {
      console.log(StoredContribution?.error);
      return res.status(400).json({ message: StoredContribution.error });
    }
    const StoreInFeedback = await StoreFilesIntoDoc_Feedback(
      userid,
      documentId
    );
    if (StoreInFeedback?.error) {
      return res
        .status(400)
        .json({ message: "Error while processing your file" });
    }
    return res.json({ message: "Upload successfull" });
  } catch (error) {
    console.error(error, "total server errors");
    return res.status(500).json({ message: "Internal Server error" });
  }
};

// functin to split text content into chunks
export async function splitTextIntoChunks(documentText) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.splitText(documentText);
  return chunks;
}

// storing the user who uploaded as the first user to like the document
const StoreFilesIntoDoc_Feedback = async (user_id, documentId) => {
  try {
    const { error: liketableError } = await supabase
      .from("LikedDocument")
      .insert({ user_id: user_id, document_id: documentId });

    if (liketableError) {
      console.log(liketableError);
      return { error: "Errror while storing file data in the feedback table" };
    }
    const { error: feedbackTableError } = await supabase
      .from("Doc_Feedback")
      .insert({
        document_id: documentId,
        upvotes: 1,
      });
    if (feedbackTableError) {
      console.log(feedbackTableError);
      return { error: "Errror while storing file data in the feedback table" };
    }
  } catch (error) {
    return {
      error: "Errro while storing the data of file in doc_feedback ",
      error,
    };
  }
};

// find the matching response values
export const FindMatchingResponse = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    if (!user_id || typeof user_id !== "string")
      return res.status(400).json({ message: "Please login to continue" });
    const { question, category, subCategory } = req.body;
    if (
      !question ||
      typeof question !== "string" ||
      !category ||
      typeof category !== "string" ||
      !subCategory ||
      typeof subCategory !== "string"
    ) {
      return res.status(400).json({ message: "Invalid question type !" });
    }
    const FoundData = [];
    const DocumentsUserForReference = [];
    //    console.log(fetchResult)
    const response = await index.searchRecords({
      query: {
        topK: 10,
        inputs: { text: question },
        filter: {
          category: { $eq: category },
          subCategory: { $eq: subCategory },
          visibility: { $eq: "Public" },
        },
      },
      fields: [
        "text",
        "category",
        "subCategory",
        "date_of_contribution",
        "documentId",
        "contributor",
      ],
    });
    // if the question is too vague
    if (response.result.hits.length === 0) {
      return res.status(200).json({
        message: "Response found",
        answer: `Could you please be more specific about what you would like to know about ${subCategory}`,
        doc_id: [],
      });
    }
    // a set to store only unique values of document ids
    const seen = new Set();

    try {
      for (const e of response.result.hits) {
        if (!e) {
          console.log("Empty resuls found");
          continue;
        }
        const uniqueKey = `${e.fields.documentId}-${e.fields.contributor}`;
        if (seen.has(uniqueKey)) continue;
        try {
          //1.  push the text results
          FoundData.push(e.fields.text);
          //2. get the data of that respective document
          const { data, error } = await supabase
            .from("Doc_Feedback")
            .select("upvotes, downvotes, partial_upvotes")
            .eq("document_id", e.fields.documentId)
            .single();

          // console.log("Document feedback")
          if (error) throw error;
          if (!data) {
            console.warn(
              `No feedback data found for document ${e.fields.documentId}`
            );
            continue;
          }
          //3. construct the data of the doc object
          DocumentsUserForReference.push({
            doc_id: e.fields.documentId,
            uploaded_by: e.fields.contributor,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            partial_upvotes: data.partial_upvotes,
          });

          seen.add(uniqueKey);
        } catch (formattingdataerror) {
          console.log(formattingdataerror);
        }
      }
    } catch (er) {
      console.error(er);
    }

    const AnswerToUsersQuestion = await GenerateResponse(question, FoundData);
    // const AnswerToUsersQuestion = 'Kya answer chahiye bhai tujhe?'
    if (AnswerToUsersQuestion.error) {
      return res.status(200).json({ answer: AnswerToUsersQuestion.error });
    }

    const storeResponses = await StoreQueryAndResponse(
      user_id,
      question,
      AnswerToUsersQuestion
    );

    if (storeResponses.error) {
      return res.status(200).json({
        message: "Could not store this request",
        answer: AnswerToUsersQuestion,
      });
    }
    return res.status(200).json({
      message: "Response found",
      answer: AnswerToUsersQuestion,
      doc_id: DocumentsUserForReference,
    });
  } catch (error) {
    console.error(error);
  }
};

// store user file upload information
export const StoreContributionDetails = async (
  name,
  email,
  feedback,
  userid,
  visibility,
  documentId,
  chunkNumber
) => {
  try {
    if (
      !name ||
      typeof name !== "string" ||
      !email ||
      typeof email !== "string" ||
      !feedback ||
      typeof feedback !== "string" ||
      !userid ||
      !chunkNumber
    ) {
      console.log("Either email or name was missing from the parameters");
      return { error: "Invalid data !" };
    }

    const { data, error } = await supabase.from("Contributions").insert({
      username: name,
      email: email,
      feedback: feedback,
      user_id: userid,
      Document_visibility: visibility,
      document_id: documentId,
      chunk_count: chunkNumber,
    });

    if (error) {
      console.log(error);
      return { error: "Error while recording you contribution details ." };
    }

    return { message: "Done" };
  } catch (error) {
    console.error(error);
    return { error: "Error while storing values in db" };
  }
};

// getting all the documents that are uploaded by the user;

export const GetPrivateUserDocs = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    if (!user_id || typeof user_id !== "string") {
      return res.status(400).json({ message: "Please Login to continue" });
    }

    const { data, error } = await supabase
      .from("Contributions")
      .select("id, feedback, created_at, document_id")
      .eq("Document_visibility", "Private");

    if (error) {
      console.log(error);
      return res
        .status(400)
        .json({ message: "Error while looking for documents !" });
    }

    // console.log(data);
    return res.json({ message: "User docs found", data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", issue: error });
  }
};

// Query personal documents of the user
export const QueryPersonalDocs = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    if (!user_id || typeof user_id !== "string") {
      return res.status(400).json({ message: "Please Login to continue" });
    }

    const { docId, question, query_type } = req.body;

    if (
      !docId ||
      typeof docId !== "string" ||
      !question ||
      typeof question !== "string" ||
      !query_type ||
      typeof query_type !== "string"
    ) {
      return res.status(400).json({ message: "Invalid values" });
    }

    const FoundData = [];
    let response;

    const SYSTEM_PROMPT =
      query_type === "QNA"
        ? process.env.SYSTEM_PROMPT
        : process.env.SUMMARIZER_PROMPT;
    if (query_type === "QNA") {
      response = await index.searchRecords({
        query: {
          topK: 30,
          inputs: { text: question },
          filter: {
            documentId: { $eq: docId },
            visibility: { $eq: "Private" },
          },
        },
        fields: ["text"],
      });

      //  console.log(response)
      if (response.result.hits.length === 0) {
        return res.status(200).json({
          message: "Response found",
          answer: `Could you please be more specific about what you would like to know about this topic`,
          doc_id: [],
        });
      }
    } else if (query_type === "Summary") {
      const { data, error } = await supabase
        .from("Contributions")
        .select("feedback , chunk_count ,username")
        .eq("document_id", docId);

      if (error || !data.length === 0) {
        return res
          .status(404)
          .json({ message: "Unable to find this document in our database" });
      }

      //   console.log(data)
      response = await getAllDocumentTextsForSummary(
        docId,
        data[0].username,
        data[0].feedback,
        data[0].chunk_count
      );
      if (!response || response.length === 0) {
        return res.status(200).json({
          message: "Response found",
          answer: `There was no data in our database about this document !`,
          doc_id: [],
        });
      }
    } else {
      // Handle invalid query_type
      return res.status(400).json({ message: "Invalid query type" });
    }
    if (response?.result?.hits) {
      response.result.hits.forEach((e) => {
        if (e) {
          FoundData.push(e.fields.text);
        } else {
          console.log("no results found");
        }
      });
    }
    {
    }

    const AnswerToUsersQuestion = await GenerateResponse(
      question,
      FoundData.length !== 0 ? FoundData : response,
      SYSTEM_PROMPT
    );
    // const AnswerToUsersQuestion = 'random text';
    if (AnswerToUsersQuestion.error) {
      console.log(AnswerToUsersQuestion.error);
      return res.status(200).json({
        message: "Error while generating a response",
        answer: "WE currently do not have information regarding this topic",
      });
    }
    const storeResponse = await StoreQueryAndResponse(
      user_id,
      question,
      AnswerToUsersQuestion,
      docId
    );

    if (storeResponse.error) {
      console.log(storeResponse?.error);
      return res.status(200).json({
        message: "Could not store this request",
        answer: AnswerToUsersQuestion,
      });
    }
    return res
      .status(200)
      .json({ message: "Response found", answer: AnswerToUsersQuestion });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while processing your request" });
  }
};

// extract text from the chunks based on the chunk Ids
export async function getAllDocumentTextsForSummary(
  docId,
  username,
  title,
  totalChunks
) {
  // console.log(docId, username, title, totalChunks)
  if (!docId || !username || !title || !totalChunks) {
    console.warn(`No chunks to fetch for document: ${docId}`);
    return [];
  }

  // Step 1: Generate all the chunk IDs based on the count from Supabase.
  const allChunkIds = [];
  let chunkId;
  for (let i = 0; i < totalChunks; i++) {
    // console.log("Running the id creattion loop")
    chunkId = `${docId.trim()}:${username.trim()}:${title.trim()}:${i}`;
    // console.log(chunkId, 'individual chunksId')

    allChunkIds.push(chunkId);
  }

  try {
    const fetchResponse = await index
      .namespace("__default__")
      .fetch(allChunkIds);
    // console.log(fetchResponse, 'fetchResponse')
    const allTextChunks = [];

    // Step 3: Extract the text from each chunk's metadata.
    for (const id of allChunkIds) {
      const record = fetchResponse.records[id];
      if (record && record.metadata && record.metadata.text) {
        allTextChunks.push(record.metadata.text);
      } else {
        console.warn(
          `Chunk with ID ${id} was not found or is missing text metadata.`
        );
      }
    }

    // Return the array of text strings.
    // console.log(allTextChunks)
    return allTextChunks;
  } catch (error) {
    console.error("Error fetching all document chunks:", error);
    return [];
  }
}

// store user response with the question that has been asked for future refrence
export const StoreQueryAndResponse = async (
  user_id,
  question,
  Ai_response,
  docId
) => {
  try {
    if (
      !user_id ||
      typeof user_id !== "string" ||
      !question ||
      typeof question !== "string" ||
      !Ai_response ||
      typeof Ai_response !== "string"
    ) {
      console.log(user_id, docId, Ai_response, question);
      console.log("All fields are necessary to store the query response");
      return { error: "Invalid arguments" };
    }
    const { error } = await supabase.from("Conversation_History").insert({
      user_id: user_id,
      question: question,
      AI_response: Ai_response,
      document_id: docId,
    });
    if (error) {
      console.error(
        "Error while storing the session data in the database:",
        error
      );
      return { error: "Error while storing the session data in the database" };
    }
    return { message: "Stored successfully" };
  } catch (error) {
    console.error("Error while storing the session information:", error);
    return { error: "Could not store the session information" };
  }
};
