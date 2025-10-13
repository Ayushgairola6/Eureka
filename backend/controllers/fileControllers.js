import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { GenerateResponse } from "./ModelController.js";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabaseHandler.js";
import {
  CheckFileTypeAndParseIt,
  chunkMarkdown,
  formatSSEChunk,
  splitMarkdown,
} from "../FilerParsers/FilerParser.js";
dotenv.config();

import {
  formatForGemini,
  FormatForHumanFallback,
  SearchQueryResults,
} from "../OnlineSearchHandler/WebSearchHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { redisClient } from "../CachingHandler/redisClient.js";
import { getIo } from "../websocketsHandler.js/socketIoInitiater.js";
const pc = new Pinecone({
  apiKey: process.env.PINECONE_DB_API_KEY,
});

export const index = pc.index("knowledge-base-index");

// current date and time
const now = new Date();
const hour = now.getHours();
const minute = now.getMinutes();

// Array of month names for clarity
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
// Array of day names
const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const dayOfMonth = now.getDate();
const dayOfWeek = dayNames[now.getDay()];
const year = now.getFullYear();
const month = monthNames[now.getMonth()];

// Format time in 12-hour format with AM/PM
const formattedTime = `${hour > 12 ? hour - 12 : hour}:${minute
  .toString()
  .padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;

// Combine all parts into a single string using a delimiter
const currentTime = `${formattedTime}|${dayOfMonth} ${month} ${year}|${dayOfWeek}`;

//upload functions
export const FileUploadHandle = async (req, res) => {
  try {
    const { category, feedback, subCategory, visibility } = req.body;
    const file = req.file;
    const userid = req.user.user_id;
    if (!userid) {
      return res.status(400).json({ message: "Please Login to continue ." });
    }
    const email = req.user.email;
    if (
      !category ||
      typeof category !== "string" ||
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
      await notifyMe(`Error while chunking the text by ${req.user.username}`);
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
      const chunkId = `${documentId.trim()}:${req.user.username.trim()}:${feedback.trim()}:${chunkNumber}`;

      // pushing the chunk data in formatted way to store in the db
      recordsToUpsert.push({
        id: chunkId,
        text: textChunks[i],
        visibility: visibility,
        category: category,
        subCategory: subCategory,
        date_of_contribution: new Date().toISOString(),
        documentId: documentId,
        contributor: userid,
      });

      // If batch is full or it's the last chunk, upsert the batch
      if (recordsToUpsert.length === batchSize || i === textChunks.length - 1) {
        try {
          await index.upsertRecords(recordsToUpsert); // Pass the array of records
          // console.log(`Upserted batch of ${recordsToUpsert.length} records.`);
          recordsToUpsert.length = 0; // Clear the batch array
        } catch (error) {
          await notifyMe(
            `Error ${error} while batch upsert the file by ${req.user.username}`
          );

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
        await notifyMe(`${error} = error while batch upserting`);
        return res
          .status(500)
          .json({ message: "Error during Pinecone upsert operation." });
      }
    }
    const StoredContribution = await StoreContributionDetails(
      email,
      feedback,
      userid,
      visibility,
      documentId,
      chunkNumber
    );

    if (StoredContribution?.error) {
      await notifyMe(StoredContribution.error);
      return res.status(400).json({ message: StoredContribution.error });
    }
    const StoreInFeedback = await StoreFilesIntoDoc_Feedback(
      userid,
      documentId
    );
    if (StoreInFeedback?.error) {
      await notifyMe(StoreInFeedback.error);
      return res
        .status(400)
        .json({ message: "Error while processing your file" });
    }
    // update the redis contributions cache
    const UserAccountDataKey = `user_id=${userid}&username=${req.user.username}'s_dashboardData`;

    const CachedContributions = await redisClient.hGet(
      UserAccountDataKey,
      "Contributionss"
    );
    const Parsed = JSON.parse(CachedContributions);
    if (Parsed) {
      const NewArrayOfContributions = Parsed.push({
        created_at: new Date().toISOString(),
        feedback: feedback,
        document_id: documentId,
        user_id: userid,
      });
      await redisClient
        .hSet(
          UserAccountDataKey,
          "Contributions",
          JSON.stringify(NewArrayOfContributions)
        )
        .catch(
          async (err) =>
            await notifyMe(
              `${err}: error occured while updating the cache for user contributions`
            )
        );
    }
    // create a new notification and inster it in the db
    const metadata = {
      sent_by_username: "System",
    };
    // add a new notification
    const { data: newNotification, error: insertError } = await supabase
      .from("notifications")
      .insert({
        user_id: userid, //person who is responsible for this notification
        notification_type: "Informatory",
        notification_message: `A new file ${feedback} uploaded .`,
        title: "New file uploaded",
        metadata: metadata,
      })
      .select("*");

    if (insertError) {
      await notifyMe(
        `${insertError}= This error occured while Inserting notification data in file upload controller `
      );
    }
    // send the notification to the user
    const io = getIo();
    io.to(userid).emit(
      "new_Notification",
      newNotification |
        [
          {
            user_id: userid,
            notification_type: "Informatory",
            notification_message: `A new file ${feedback} uploaded`,
            title: "New file uploaded",
            metadata: metadata,
          },
        ]
    );
    return res.json({ message: "Upload successfull" });
  } catch (error) {
    await notifyMe(error);
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
export const GetPublicRecords = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    if (!user_id || typeof user_id !== "string")
      return res.status(400).json({ message: "Please login to continue" });
    // const { question, category, subCategory } = req.body;
    const { question, category, subCategory } = req.body;
    if (
      !question ||
      typeof question !== "string" ||
      !category ||
      typeof category !== "string" ||
      !subCategory ||
      typeof subCategory !== "string"
    ) {
      return res
        .status(400)
        .json({ message: "Some fields are missing or the query is Invalid !" });
    }

    //  setting the specific headers for stream type

    // finding info regarding that query
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
      await notifyMe(
        `No info found in db about category=${category} question=${question} subcategory=${subCategory}`
      );
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
          await notifyMe(formattingdataerror);
        }
      }
    } catch (er) {
      await notifyMe(
        `${JSON.stringify(
          er
        )}= error while getting documents id from database for documents used for this AI response`
      );
    }

    let AnswerToUsersQuestion = await GenerateResponse(question, FoundData);

    if (AnswerToUsersQuestion.error) {
      return res.status(200).send({ answer: "Server busy" });
    }

    const storeResponses = await StoreQueryAndResponse(
      user_id,
      question,
      AnswerToUsersQuestion,
      null,
      category,
      subCategory
    );

    if (storeResponses.error) {
      await notifyMe(
        `${storeResponses.error} eror while storing the convversation`
      );
      return res.status(200).json({
        message: "Could not store this request",
        answer: AnswerToUsersQuestion,
      });
    }

    // updating the chats cache
    try {
      const misallaneousChatsKey = `user=${req.user.username}'s_misallaneousChats`;
      // update the chats cache in redis
      const OldChats = await redisClient.get(misallaneousChatsKey);
      if (OldChats) {
        const newChats = JSON.parse(OldChats);
        newChats.push({
          created_at: new Date().toISOString(),
          question: question,
          AI_response: AnswerToUsersQuestion,
        });
        // console.log("new misallaneous chats", newChats[newChats.length - 1]);

        //update the value of the key
        await redisClient.set(misallaneousChatsKey, JSON.stringify(newChats), {
          expiration: {
            type: "Ex",
            value: 600,
          },
        });
      }
    } catch (cachingerror) {
      await notifyMe(
        `Error while updating the misallaneous cache =${cachingerror} `
      );
    }
    const responseId = uuidv4();

    return res.status(200).json({
      message: "Response found",
      answer: AnswerToUsersQuestion,
      doc_id: DocumentsUserForReference || [],
    });
  } catch (err) {
    await notifyMe(err);
    return res.status(500).send({ message: "Server busy" });
  }
};

// store user file upload information
export const StoreContributionDetails = async (
  email,
  feedback,
  userid,
  visibility,
  documentId,
  chunkNumber
) => {
  try {
    if (
      !email ||
      typeof email !== "string" ||
      !feedback ||
      typeof feedback !== "string" ||
      !userid ||
      !chunkNumber
    ) {
      return { error: "Invalid data !" };
    }

    const { data, error } = await supabase.from("Contributions").insert({
      email: email,
      feedback: feedback,
      user_id: userid,
      Document_visibility: visibility,
      document_id: documentId,
      chunk_count: chunkNumber,
    });

    if (error) {
      return { error: "Error while recording you contribution details ." };
    }

    return { message: "Done" };
  } catch (error) {
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
export const GetPrivateDocResultss = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).send({ message: "Please login to continue" });
    }

    const { docId, question, query_type, MessageId } = req.body;

    if (
      !MessageId ||
      !docId ||
      typeof docId !== "string" ||
      !question ||
      typeof question !== "string" ||
      !query_type ||
      typeof query_type !== "string"
    ) {
      await notifyMe(
        `Error while asking question from private doc by user=${
          req.user.username
        } the req.body is like this = ${JSON.stringify(req.body)}`
      );
      return res.status(400).send({ message: "Something went wrong" });
    }
    //  setting the specific headers for stream type

    const FoundData = [];
    let response;

    const SYSTEM_PROMPT =
      query_type === "QNA"
        ? process.env.SYSTEM_PROMPT
        : query_type === "Summary"
        ? process.env.SUMMARIZER_PROMPT
        : process.env.WEB_SEARCH_RESULT_PROMPT;

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

      if (response.result.hits.length === 0) {
        return res.status(200).send({
          message: "Response found",
          Answer:
            "I was unable to find anything related to you question in your document . If you could be more specific about what you want to know about this document I will be able to assist you properly.",
        });
      }
    }
    // if the query is summary type
    else if (query_type === "Summary") {
      const { data, error } = await supabase
        .from("Contributions")
        .select("feedback , chunk_count ,username")
        .eq("document_id", docId);

      if (error || !data.length === 0) {
        return res
          .status(400)
          .send({ message: "Error while generating a response" });
      }

      //   console.log(data)
      response = await getAllDocumentTextsForSummary(
        docId,
        data[0].username,
        data[0].feedback,
        data[0].chunk_count
      );
      if (!response || response.length === 0) {
        return res
          .status(400)
          .send({ message: "Error while generating a response" });
      }
    } else {
      // Handle invalid query_type
      return res.status(400).send({ message: "Invalid query type" });
    }

    if (response?.result?.hits) {
      response.result.hits.forEach((rest) => {
        if (rest._score && rest.fields.text) {
          FoundInformation.push({
            _score: rest._score,
            text: rest.fields.text,
          });
        }
      });
    }

    // geenrating the response based on the found context
    const AnswerToUsersQuestion = await GenerateResponse(
      question,
      FoundData.length !== 0 ? FoundData : response,
      SYSTEM_PROMPT
    );
    // console.log(AnswerToUsersQuestion, "anser to qustion");
    if (AnswerToUsersQuestion?.error) {
      return res.status(400).send({
        message:
          "The server is very busy right now , that is why I am having trouble while generating a response ,thank you for understanding.",
      });
    }

    const storeResponse = await StoreQueryAndResponse(
      user.user_id,
      question,
      AnswerToUsersQuestion,
      docId
    );

    if (storeResponse.error) {
      await notifyMe(`Error while storing message  ${storeResponse.error}`);
    }

    // find the update the cache
    const DocumentChatCacheKey = `document=${docId}'s_chat-history`;
    const OldChats = await redisClient.get(DocumentChatCacheKey);
    if (OldChats) {
      const newChats = JSON.parse(OldChats);
      newChats.push({
        created_at: new Date().toISOString(),
        question: question,
        AI_response: AnswerToUsersQuestion,
      });
      // update the cache
      await redisClient.set(DocumentChatCacheKey, JSON.stringify(newChats), {
        expiration: {
          type: "EX",
          value: 600,
        },
      });
    }
    return res.status(200).send({
      message: "Response found",
      Answer: AnswerToUsersQuestion,
    });
  } catch (err) {
    await notifyMe(`Error from Private doc result ${err}`);
    return res.status(500).send({ message: "Server busy" });
  }
};
// Do websearch
export const PostTypeWebSearch = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    if (!user_id)
      return res.status(401).send({ message: "Please login to continue" });
    const { question, MessageId } = req.body;
    if (!question) return res.status(404).send({ message: "Invalid question" });

    const WebResults = await SearchQueryResults(question);
    if (WebResults.error) {
      await notifyMe(WebResults.error);
      return res.status(400).send({ message: "The server is busy right now" });
    }
    const Formattedresult = formatForGemini(WebResults.response);
    if (!Formattedresult) {
      await notifyMe(`${Formattedresult}, "Results formatting error"`);
      return res.status(400).send({ message: "The server is busy right now" });
    }

    const WebResultPrompt = process.env.WEB_SEARCH_RESULT_PROMPT;
    let Answer = await GenerateResponse(
      question,
      Formattedresult,
      WebResultPrompt
    );
    if (Answer.error) {
      // console.error(Answer.error, "Gemini response generation error");
      await notifyMe(
        `Error while generating a response by gemini :${Answer.error}`
      );
      // fallback response
      const results = await FormatForHumanFallback(WebResults.response);
      Answer = results.text;
    }

    const StoreChats = await StoreQueryAndResponse(user_id, question, Answer);
    if (StoreChats.error) {
      await notifyMe(
        `Error while storing response history ${StoreChats.error}`
      );
    }

    // find the update the chats
    const misallaneousChatsKey = `user=${req.user.username}'s_misallaneousChats`;
    // update the chats cache in redis
    const OldChats = await redisClient.get(misallaneousChatsKey);
    if (OldChats) {
      const newChats = JSON.parse(OldChats);
      newChats.push({
        created_at: new Date().toISOString(),
        question: question,
        AI_response: Answer.text,
      });

      //update the value of the key
      await redisClient.set(misallaneousChatsKey, JSON.stringify(newChats), {
        expiration: {
          type: "Ex",
          value: 600,
        },
      });
    }

    const FormattedFavicon = {
      MessageId,
      icon: WebResults.favicon,
    };
    console.log(FormattedFavicon);
    return res.send({
      Answer: Answer,
      message: "Results found",
      favicon: { MessageId: MessageId, icon: WebResults.favicon || [] },
    });
  } catch (err) {
    await notifyMe(err);
    return res.status(500).send({ message: "Something went wrong" });
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
  docId,
  category,
  subCategory
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
      return { error: "Invalid arguments" };
    }
    const metadata = {
      category: category,
      subCategory: subCategory,
    };
    const { error } = await supabase.from("Conversation_History").insert({
      user_id: user_id,
      question: question,
      AI_response: Ai_response,
      document_id: docId,
      metadata: metadata,
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
