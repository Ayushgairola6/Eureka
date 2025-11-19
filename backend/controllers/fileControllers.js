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
  HandleSourceCreation,
  processContextStringCreation,
  splitMarkdown,
} from "../FilerParsers/FilerParser.js";
dotenv.config();

import {
  formatForGemini,
  FormatForHumanFallback,
  SearchQueryResults,
} from "../OnlineSearchHandler/WebSearchHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import {
  redisClient,
  UpdateTheNotificationCache,
  UpdateUserFileListCacheInfo,
} from "../CachingHandler/redisClient.js";
import { getIo } from "../websocketsHandler.js/socketIoInitiater.js";
import {
  CheckCreditLimitPerUser,
  HandleUserCreditCachingOrUpdationOrCreation,
  UpdateUserCreditLimit,
} from "./UserCreditLimitController.js";
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

//upload file handler
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

    const ParsedText = await CheckFileTypeAndParseIt(file);
    const textChunks = await splitTextIntoChunks(ParsedText);

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
    const batchSize = req.user.PaymentStatus === true ? 90 : 50;
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
          await index.upsertRecords(recordsToUpsert); //upsert the records
          // console.log(`Upserted batch of ${recordsToUpsert.length} records.`);
          recordsToUpsert.length = 0; // reset the records array
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

    // If there are any remaining records after the loop
    // in case of records less than batchsize
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
    // storing the contribution details
    const StoredContribution = await StoreContributionDetails(
      email,
      feedback,
      userid,
      visibility,
      documentId,
      chunkNumber
    );
    const UserAccountDataKey = `user_id=${userid}&username=${req.user.username}'s_dashboardData`;

    if (StoredContribution?.error) {
      await notifyMe(StoredContribution.error);
      return res.status(400).json({ message: StoredContribution.error });
    }
    if (StoredContribution.InsertedData) {
      console.log(
        "Caching the info stored in the db related to the file upload info"
      );

      // handle user cache information if the documents are not private
      if (visibility !== "Private") {
        await UpdateUserFileListCacheInfo(
          UserAccountDataKey,
          StoredContribution.InsertedData
        );
      }
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
      .select("*")
      .single();

    if (insertError) {
      await notifyMe(
        `${insertError}= This error occured while Inserting notification data in file upload controller `
      );
    }
    // update the notification in the cache as well if exists
    await UpdateTheNotificationCache(
      UserAccountDataKey,
      newNotification |
        {
          user_id: userid,
          notification_type: "Informatory",
          notification_message: `A new file ${feedback} uploaded`,
          title: "New file uploaded",
          metadata: metadata,
        }
    );

    return res.json({ message: "Upload successfull" });
  } catch (error) {
    console.log(error);
    await notifyMe(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
//deleting the whole information of a file except the data of public contributed files;
export const DeleteFileHandle = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).send({ message: "Please login to continue" });
    }

    const io = getIo();
    const { document_id } = req.query;

    if (!document_id || typeof document_id !== "string") {
      return res.status(400).send({ message: "Invalid document information" });
    }

    // deleting from normal database
    const { error } = await supabase
      .from("Contributions")
      .delete()
      .eq("document_id", document_id);

    if (error) {
      return res.status(400).send({
        message: "An error occured while deleting your file , please try again",
      });
    }
    // deleting the chunks of file from the vector database;
    try {
      const deletingFile = await index.deleteMany({ documentId: document_id });
    } catch (deletingFromVectorDbError) {
      return res
        .status(400)
        .send({ message: "Error while deleting your document." });
    }

    // users dashboard info cache key
    const UserAccountDataKey = `user_id=${user.user_id}&username=${user.username}'s_dashboardData`;

    // delete the file record from the cache too
    const contributionsExits = await redisClient.exists(UserAccountDataKey);
    if (contributionsExits) {
      const Contributions = await redisClient.hGet(
        UserAccountDataKey,
        "Contributions"
      );
      const NewContributions = JSON.parse(Contributions);
      // removing the designated files info from the cache as well
      for (let i = 0; i < NewContributions?.length; i++) {
        if (NewContributions[i].document_id === document_id) {
          // delete the information of the whole document from the cache too
          NewContributions.splice(NewContributions[i], 1);
          await redisClient.hSet(
            UserAccountDataKey,
            "Contributions",
            JSON.stringify(NewContributions)
          );
        }
      }
    }

    // if(io){
    //   io.to(user.user_id).emit('new_notification',)
    // }

    return res.send({ message: "File deleted" });
  } catch (error) {
    await notifyMe(`Error in deleting file function`, error);
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
    const { question, category, subCategory, MessageId } = req.body;
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

    // update the daily quota of the user
    const UpdateState = await HandleUserCreditCachingOrUpdationOrCreation(
      req.user
    );

    // if user has reached the
    if (UpdateState.status.includes("not ok")) {
      return res.status(200).send({
        Answer: UpdateState.message,
        message: "Reached todays limit",
        docUsed: [],
      });
    }

    // finding info regarding that query
    const FoundData = `This is the information found from the database that is shared by several contributors :`;
    let DocumentsUserForReference;
    //    console.log(fetchResult)
    const response = await index.searchRecords({
      query: {
        topK: req.user.PaymentStatus === true ? 100 : 30,
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
      ],
    });
    // processing the results
    const seen = new Set(); //a set to store processed document ids
    try {
      // if the question is too vague
      if (response.result.hits.length === 0) {
        await notifyMe(
          `No info found in db about category=${category} question=${question} subcategory=${subCategory}`
        );
        return res.status(200).json({
          message: "Response found",
          answer: `Looks like I do not have any information regarding your question right now. You can try using our web search functionality to get answer to your questions ${subCategory} `,
          docUsed: [],
        });
      }

      // creating a context string
      const FoundData = await processContextStringCreation(response);

      if (FoundData.message) {
        return res.status(200).send({
          message: "Unable to generate a response",
          answer: FoundData.message,
          docUsed: { MessageId, docs: [] },
        });
      }
      const DocumentsUserForReference = await HandleSourceCreation(
        response,
        req.user.PaymentStatus,
        MessageId
      );

      // a set to store only unique values of document ids
    } catch (er) {
      await notifyMe(
        ` error while getting documents id from database for documents used for this AI response`,
        er
      );
    }

    const AnswerToUsersQuestion = await GenerateResponse(
      question,
      `This is the information found from the public knowledgebase =${FoundData}`,
      process.env.SYSTEM_PROMPT,
      req.user.PaymentStatus
    );

    // const AnswerToUsersQuestion = "THis is a hardcoded answer";

    // const AnswerToUsersQuestion =
    //   "this is a mock answer just to test the information";
    // // if (AnswerToUsersQuestion.error) {
    // //   return res.status(200).send({ answer: "Server busy" });
    // // }

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
        docUsed: DocumentsUserForReference,
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
      docUsed: DocumentsUserForReference,
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
      typeof chunkNumber !== "number"
    ) {
      console.log(
        "Some fields are missing",
        email,
        feedback,
        userid,
        visibility,
        documentId,
        chunkNumber
      );
      return { error: "Invalid data !" };
    }

    const { data, error } = await supabase
      .from("Contributions")
      .insert({
        email: email,
        feedback: feedback,
        user_id: userid,
        Document_visibility: visibility,
        document_id: documentId,
        chunk_count: chunkNumber,
      })
      .select("*")
      .single();

    if (error) {
      return { error: "Error while recording you contribution details ." };
    }

    return { message: "Done", InsertedData: data };
  } catch (error) {
    console.log(error);
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
    const { IsPremiumUser } = req.user;
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
        } the req.body is like this = ${JSON.stringify(req.body)}`,
        "sometgin broke the functionality"
      );
      return res.status(400).send({ message: "Something went wrong" });
    }
    //  setting the specific headers for stream type
    // check the current credit limit record for the user
    const UpdateState = await HandleUserCreditCachingOrUpdationOrCreation(
      req.user
    );

    // if user has reached the
    if (UpdateState?.status && UpdateState?.status.includes("not ok")) {
      return res.status(200).send({
        Answer: UpdateState.message,
        message: "Limit reached found",
      });
    }

    const FoundData = [];
    let response;

    const SYSTEM_PROMPT =
      query_type === "QNA"
        ? process.env.SYSTEM_PROMPT
        : query_type === "Summary"
        ? process.env.SUMMARIZER_PROMPT
        : process.env.WEB_SEARCH_RESULT_PROMPT;

    // if the query is of qna type
    if (query_type === "QNA") {
      response = await index.searchRecords({
        query: {
          topK: req.user.PaymentStatus === false ? 30 : 100, //quota based system
          inputs: { text: question },
          filter: {
            documentId: { $eq: docId },
            visibility: { $eq: "Private" },
          },
        },
        fields: ["text"],
      });

      // if no matching chunks found in the db
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
      if (IsPremiumUser === false) {
        return res.status(403).send({
          message: "You need an active subscription to use this feature.",
        });
      }
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
    let FormattedContextString = `This is the question the user asked =${question} and the relevant results are these with necessary information to analyze them, `;
    // extracting the text and score from the vector results and formatting it for gemini
    if (response?.result?.hits) {
      const formattedContext = response.result.hits
        .map((rest, index) => {
          // create a string of results
          if (rest._score && rest.fields.text) {
            return `ArrayBasedrank=${index + 1}&relevancy_score=${
              rest._score
            }&actual_content${rest.fields.text}`;
          }
        })
        .filter(Boolean);

      // appending the text to the context string for better understanding and accurate results
      FormattedContextString += formattedContext;
      // FoundData.push(...formattedContext);
    }

    // geenrating the response based on the found context
    const AnswerToUsersQuestion = await GenerateResponse(
      question,
      FormattedContextString !== 0
        ? FormattedContextString
        : "No relevant results were found in the database",
      SYSTEM_PROMPT
    );

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
          value: 1000,
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

    const IsPremiumUser = req.user.PaymentStatus;
    if (IsPremiumUser === null || IsPremiumUser === undefined) {
      return res.status(403).send({
        message:
          "Please logout and logIn again to be able to experience new features",
      });
    }
    const { question, MessageId } = req.body;
    // if (!question) return res.status(404).send({ message: "Invalid question" });

    // check the current credit limit record for the user
    const UpdateState = await HandleUserCreditCachingOrUpdationOrCreation(
      req.user
    );

    // if user has reached the
    if (UpdateState.status.includes("not ok")) {
      return res.status(200).send({
        Answer: UpdateState.message,
        message: "Limit reached found",
        favicon: [],
      });
    }
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
      console.error(Answer.error, "Gemini response generation error");
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
      icon: [],
    };
    //     const Answer = `
    // # Hello World 👋

    // This is a sample **Markdown** content stored in a JavaScript variable.

    // ## Features

    // - Bullet points
    // - **Bold text**
    // - *Italic text*
    // - [Link to Copilot](https://copilot.microsoft.com)

    // > This is a blockquote.

    // \`\`\`js
    // // Code block
    // function greet() {
    //   console.log("Hello from Markdown!");
    // }
    // \`\`\`
    // `;

    //  now that we have generated all the response and data for the user
    // we need to check if the user is within the credit limit or does even has a record in db and cache
    //if true we update the value in both else we create a new record

    return res.send({
      Answer: Answer,
      message: "Results found",
      favicon: FormattedFavicon,
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
