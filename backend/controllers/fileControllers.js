import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import {
  FilterIntent,
  FindIntent,
  GenerateResponse,
} from "./ModelController.js";
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
  SearchQueriesResults,
  SearchQueryResults,
} from "../OnlineSearchHandler/WebSearchHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import {
  CacheCurrentChat,
  redisClient,
  UpdateTheNotificationCache,
  UpdateUserFileListCacheInfo,
} from "../CachingHandler/redisClient.js";
import { EmitEvent, getIo } from "../websocketsHandler.js/socketIoInitiater.js";
import {
  CheckUserContributionCount,
  ProcessUserQuery,
} from "./UserCreditLimitController.js";
import {
  IntentIdentifier,
  KNOWLEDGE_DISTRIBUTOR_PROMPT,
  SUMMARIZATION_ANALYST_PROMPT,
  WEB_SEARCH_DISTRIBUTOR_PROMPT,
} from "../Prompts/Prompts.js";
import { GetChatsForContext } from "../Synthesis/phase2_action.js";
import {
  FilterUrlForExtraction,
  FormattForLLM,
  GetDataFromSerper,
  ProcessForLLM,
} from "../OnlineSearchHandler/WebCrawler.js";
// import {
//   generateEmbedding,
//   generateEmbeddingsWithGoogle,
// } from "../embeddings/Embeddings.js";
// import { UpsertDocs } from "../UpsertHandler.js/upsert.js";
export const pc = new Pinecone({
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
export const currentTime = `${formattedTime}|${dayOfMonth} ${month} ${year}|${dayOfWeek}`;

//upload file handler
export const FileUploadHandle = async (req, res) => {
  try {
    const { category, feedback, subCategory, visibility, about } = req.body;
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
      !visibility ||
      !about ||
      typeof about !== "string"
    ) {
      return res.status(400).json({ message: "Invalid data type !" });
    }
    const documentId = uuidv4();

    EmitEvent(userid, "UploadStatus", "Parsing Document");
    const ParsedText = await CheckFileTypeAndParseIt(file);
    // console.log(ParsedText);

    if (!ParsedText) {
      return res.status(400).send({
        message: "An error occured while extracting text from your file",
      });
    }

    const textChunks = await splitTextIntoChunks(ParsedText);

    // get the file extension type and append to the title
    const FileType = file.originalname.split(".").pop().toLowerCase();
    if (!textChunks || textChunks.length === 0) {
      await notifyMe(`Error while chunking the text by ${req.user.username}`);
      return res.status(400).json({
        message: "Error while processing your file",
      });
    }

    EmitEvent(userid, "UploadStatus", "Creating Chunks");

    //limit of texts for free  users
    // if (req.user.PaymentStatus === false && textChunks.length > 25) {
    //   return res.status(400).send({
    //     message: "Purchase our premium to be able to upload large documents.",
    //   });
    // }

    //check user contributioncount
    //currently for only free users
    // later for other tiers as well
    // if (req.user.PaymentStatus === false) {
    //   const checkUpperBound = await CheckUserContributionCount(req.user);

    //   if (
    //     checkUpperBound &&
    //     checkUpperBound.message.trim().toLowerCase().includes("limit reached")
    //   ) {
    //     return res.status(400).send({
    //       message: `You've reached your limit of 2 private documents for the free tier. Upgrade your plan to upload more and unlock additional features.`,
    //     });
    //   }
    // }

    // random id for the doc
    let chunkNumber;
    // array to store a unique record array for upsert operation
    const recordsToUpsert = [];
    // the size of one batch that we process
    const batchSize = req.user.PaymentStatus === true ? 50 : 10;
    // loop to start pushing chunks into the db
    for (let i = 0; i < textChunks.length; i++) {
      // Generate a unique ID for each chunk
      // Option 1: documentId-chunkIndex (simple)
      chunkNumber = i;
      const chunkId = `id=${documentId.trim()}:chunkcount=${chunkNumber}`;

      // pushing the chunk data in formatted way to store in the db
      recordsToUpsert.push({
        id: chunkId,
        text: textChunks[i],
        visibility: visibility,
        category: category,
        subCategory: subCategory,
        date_of_contribution: new Date().toISOString().split("T")[0],
        documentId: documentId,
        contributor: userid,
      });

      // If batch is full or it's the last chunk, upsert the batch
      if (recordsToUpsert.length === batchSize || i === textChunks.length - 1) {
        try {
          EmitEvent(userid, "UploadStatus", "Upserting vectors");

          await index.upsertRecords(recordsToUpsert); //upsert the records
          // console.log(`Upserted batch of ${recordsToUpsert.length} records.`);
          recordsToUpsert.length = 0; // reset the records array
        } catch (error) {
          await notifyMe(
            `Error ${error} while batch upsert the file by ${req.user.username}`
          );

          // Implement more specific error handling if needed
          return res.status(500).json({
            message: "Error during Pinecone upsert operation.",
            insertData: {
              id: "Not found",
              chunk_count: 0,
              feedback: feedback,
              created_at: new Date().toISOString(),
              document_id: documentId,
            },
          });
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
        return res.status(500).json({
          message: "Error during Pinecone upsert operation.",
          insertData: {
            id: "Not found",
            chunk_count: 0,
            feedback: feedback,
            created_at: new Date().toISOString(),
            document_id: documentId,
          },
        });
      }
    }
    const documentmetadata = {
      category: category,
      subCategory: subCategory,
      about: about,
    };
    // storing the contribution details
    EmitEvent(userid, "UploadStatus", "Creating Record");
    const StoredContribution = await StoreContributionDetails(
      `${feedback}.${FileType}`,
      userid,
      visibility,
      documentId,
      chunkNumber,
      documentmetadata
    );
    const UserAccountDataKey = `user_id=${userid}'s_dashboardData`;

    if (StoredContribution?.error) {
      await notifyMe(StoredContribution.error);
      return res.status(400).json({
        message: StoredContribution.error,
        insertData: {
          id: "Not found",
          chunk_count: chunkNumber,
          feedback: feedback,
          document_id: documentId,
        },
      });
    }
    if (StoredContribution.InsertedData) {
      // handle user cache information if the documents are not private
      if (visibility === "Private") {
        await UpdateUserFileListCacheInfo(
          UserAccountDataKey,
          StoredContribution.InsertedData
        );
      }
    }

    /// update the notifications
    const result = await UpdateTheNotificationCache(
      UserAccountDataKey,
      userid,
      feedback
    );

    if (result && result.newNotification) {
      EmitEvent(userid, "new_Notification", result.newNotification);
    }

    return res.json({
      message: "Upload successfull",
      insertData: StoredContribution.InsertedData || {},
    });
  } catch (error) {
    console.log(error);
    await notifyMe(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

//helper function to insert the records
export async function InsertRecords(ReferenceArray) {
  if (ReferenceArray.length === 0) {
    return { message: "Array is empty in the inertrecords function" };
  }

  const { error } = await supabase
    .from("DocumenteEmbeddings")
    .insert(ReferenceArray);

  if (error) {
    console.error(
      error,
      "An error occured in the embeddings upsertion handler"
    );
    return { message: "Failed" };
  }

  return { message: "Upserted" };
}

//deleting the whole information of a file except the data of public contributed files;
export const DeleteFileHandle = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).send({ message: "Please login to continue" });
    }

    // console.log("reaced here");
    const { document_id } = req.query;

    let preference;
    const UserAccountDataKey = `user_id=${user.user_id}'s_dashboardData`;
    const info = await redisClient.hGet(UserAccountDataKey, "userdata");

    if (info) {
      const parsed = JSON.parse(info);
      preference = parsed.AllowedTrainingModels;
    } else {
      const { data, error } = await supabase
        .from("users")
        .select("AllowedTrainingModels")
        .eq("id", user.user_id)
        .single();

      if (error) {
        return res.status(400).send({ message: "Something went wrong" });
      }

      if (data) {
        preference = data.AllowedTrainingModels;
      }
    }

    if (!document_id || typeof document_id !== "string") {
      return res.status(400).send({ message: "Invalid document information" });
    }

    //deleting the chat history of this document
    if (preference === "NO") {
      const deletion = await deleteFileData(document_id, user); //
      if (deletion?.error) {
        return res.status(400).send({ message: deletion.error });
      }
      // delete all the ifnormation related to the file
    } else {
      const { error } = await supabase
        .from("Contributions")
        .update({ user_id: null })
        .eq("document_id", document_id)
        .eq("user_id", user.user_id);
      if (error) {
        return res.status(400).send({ message: "Something went wrong" });
      }
    }

    // users dashboard info cache key

    // delete the file record from the cache too
    const Contributions = await redisClient.hGet(
      UserAccountDataKey,
      "Contributions"
    );
    if (Contributions) {
      const NewContributions = JSON.parse(Contributions);
      // removing the designated files info from the cache as well

      const i = NewContributions.findIndex(
        (e) => e.document_id === document_id
      );

      NewContributions.splice(i, 1); // i is the index of the value and 1 is the count of values to be deleted
      await redisClient.hSet(
        UserAccountDataKey,
        "Contributions",
        JSON.stringify(NewContributions)
      );
    }

    return res.send({ message: "File deleted" });
  } catch (error) {
    console.error(error);
    await notifyMe(`Error in deleting file function`, error);
    return res.status(500).send({ message: "Something went wrong!" });
  }
};
// functin to split text content into chunks
export async function splitTextIntoChunks(documentText) {
  const customSeparators = [
    "\n\n",
    "\n\n--- PAGE BREAK ---\n\n", // Great idea to keep this marker!
    "\n",
    " ",
    "",
  ];
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: customSeparators,
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
    const { question, category, subCategory, MessageId, userMessageId } =
      req.body;
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
    // const UpdateState = await ProcessUserQuery(req.user, "Public");

    // // if user has reached the
    // if (UpdateState.status.trim().toLowerCase().includes("not ok")) {
    //   return res.status(200).send({
    //     Answer: UpdateState.message,
    //     message: "Todays quota has finished!",
    //     docUsed: [],
    //   });
    // }

    // finding info regarding that query

    let DocumentsUserForReference;
    //    console.log(fetchResult)
    const response = await index.searchRecords({
      query: {
        topK: req.user.PaymentStatus === true ? 300 : 100,
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

    let finalinfo;
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
      // console.log(FoundData);
      finalinfo = FoundData;
      if (FoundData.message || !FoundData) {
        return res.status(200).send({
          message: "Unable to generate a response",
          answer: FoundData.message,
          docUsed: { MessageId, docs: [] },
        });
      }
      DocumentsUserForReference = await HandleSourceCreation(
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
    const message = {
      id: userMessageId, //users message Id
      sent_by: "You", //sent by the user
      message: { isComplete: true, content: question },
      sent_at: currentTime,
    };
    // update the cache
    await CacheCurrentChat(message, req.user);

    const AnswerToUsersQuestion = await GenerateResponse(
      question,
      finalinfo,
      KNOWLEDGE_DISTRIBUTOR_PROMPT,
      req.user
    );

    // const AnswerToUsersQuestion = "THis is a hardcoded answer";

    // const AnswerToUsersQuestion =
    //   "this is a mock answer just to test the information";
    if (AnswerToUsersQuestion.error) {
      return res
        .status(200)
        .send({ answer: "An error occured while generatinga  response" });
    }

    const AImessage = {
      id: MessageId, //users message Id
      sent_by: "AntiNode", //sent by the user
      message: { isComplete: true, content: AnswerToUsersQuestion },
      sent_at: currentTime,
    };
    // update the cache
    await CacheCurrentChat(AImessage, req.user);

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
        `${storeResponses.error} error while storing the convversation`
      );
      return res.status(200).json({
        message: "Could not store this request",
        answer: AnswerToUsersQuestion,
        docUsed: DocumentsUserForReference,
      });
    }

    // console.log(AnswerToUsersQuestion);
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
    // const responseId = uuidv4();

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
  feedback,
  userid,
  visibility,
  documentId,
  chunkNumber,
  documentmetadata
) => {
  try {
    if (
      !feedback ||
      typeof feedback !== "string" ||
      !userid ||
      typeof chunkNumber !== "number" ||
      !documentmetadata
    ) {
      return { error: "Invalid data !" };
    }

    const { data, error } = await supabase
      .from("Contributions")
      .insert({
        feedback: feedback,
        user_id: userid,
        Document_visibility: visibility,
        document_id: documentId,
        chunk_count: chunkNumber,
        metadata: documentmetadata,
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

    const { docId, question, query_type, userMessageId, MessageId } = req.body;

    if (
      !userMessageId ||
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
    const UpdateState = await ProcessUserQuery(req.user, "ask_private");

    // if user has reached the
    if (UpdateState.status.trim().toLowerCase().includes("not ok")) {
      return res.status(200).send({
        Answer: UpdateState.message,
        message: "Todays quota has finished!",
        docUsed: [],
      });
    }

    const FoundData = [];
    let response;

    const SYSTEM_PROMPT =
      query_type === "QNA"
        ? KNOWLEDGE_DISTRIBUTOR_PROMPT
        : query_type === "Summary"
        ? SUMMARIZATION_ANALYST_PROMPT
        : WEB_SEARCH_DISTRIBUTOR_PROMPT;

    // if the query is of qna type
    if (query_type === "QNA") {
      response = await index.searchRecords({
        query: {
          topK: req.user.PaymentStatus === false ? 100 : 200, //quota based system
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
        .select(" chunk_count")
        .eq("document_id", docId);

      if (error || !data.length === 0) {
        return res
          .status(400)
          .send({ message: "Error while generating a response" });
      }

      //   console.log(data)
      response = await getAllDocumentTextsForSummary(
        docId,
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

      ///if the response is from fetch metho
    } else {
      response.forEach((str) => {
        FormattedContextString += str;
      });
    }
    // user message object
    const message = {
      id: userMessageId, //users message Id
      sent_by: "You", //sent by the user
      message: { isComplete: true, content: question },
      sent_at: currentTime,
    };
    // update the cache
    await CacheCurrentChat(message, user);
    // geenrating the response based on the found context
    const AnswerToUsersQuestion = await GenerateResponse(
      question,
      FormattedContextString !== 0
        ? FormattedContextString
        : "No relevant results were found in the database",
      SYSTEM_PROMPT,
      user
    );

    if (AnswerToUsersQuestion?.error) {
      return res.status(400).send({
        message:
          "The server is very busy right now , that is why I am having trouble while generating a response ,thank you for understanding.",
      });
    }
    const Aimessage = {
      id: MessageId, //AI  message Id
      sent_by: "AntiNode", //sent by the model
      message: { isComplete: true, content: AnswerToUsersQuestion },
      sent_at: currentTime,
    };
    // update the cache
    await CacheCurrentChat(Aimessage, user);

    // store in the db
    const storeResponse = await StoreQueryAndResponse(
      user.user_id,
      question,
      AnswerToUsersQuestion,
      docId
    );

    if (storeResponse.error) {
      await notifyMe(`Error while storing message  ${storeResponse.error}`);
    }
    if (storeResponse?.insertData) {
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
          value: 1500,
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
    const { question, MessageId, userMessageId } = req.body;
    if (!question) return res.status(404).send({ message: "Invalid question" });

    // check the current credit limit record for the user
    const UpdateState = await ProcessUserQuery(req.user, "web_search");

    // if user has reached the
    if (UpdateState.status.trim().toLowerCase().includes("not ok")) {
      return res.status(200).send({
        Answer: UpdateState.message,
        message: "Todays quota has finished!",
        docUsed: [],
      });
    }
    let history = [];
    const pastConversation = await GetChatsForContext(req.user);
    if (!pastConversation || pastConversation.length === 0) {
      history.push(`Failed to get session chat history`);
    } else {
      history = [...pastConversation];
    }

    // get necessary links from serper
    const response = await GetDataFromSerper(question, req.user);
    // console.log(response);

    if (!response) {
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }
    // const response = {
    //   searchParameters: {
    //     q: "what are neural networks?",
    //     type: "search",
    //     engine: "google",
    //   },
    //   organic: [
    //     {
    //       title: "What Is a Neural Network?",
    //       link: "https://www.ibm.com/think/topics/neural-networks",
    //       snippet:
    //         'A neural network is a machine learning model that stacks simple "neurons" in layers and learns pattern-recognizing weights and biases from data to map inputs to ...',
    //       position: 1,
    //     },
    //     {
    //       title: "Neural network (machine learning)",
    //       link: "https://en.wikipedia.org/wiki/Neural_network_(machine_learning)",
    //       snippet:
    //         "A neural network consists of connected units or nodes called artificial neurons, which loosely model the neurons in the brain. Artificial neuron models that ...",
    //       position: 2,
    //     },
    //     {
    //       title: "What is a Neural Network?",
    //       link: "https://www.geeksforgeeks.org/machine-learning/neural-networks-a-beginners-guide/",
    //       snippet:
    //         "Neural networks are machine learning models that mimic the complex functions of the human brain. These models consist of interconnected nodes or neurons that ...",
    //       date: "Dec 16, 2025",
    //       position: 3,
    //     },
    //     {
    //       title: "ELI5: What are neural networks? : r/explainlikeimfive",
    //       link: "https://www.reddit.com/r/explainlikeimfive/comments/14he980/eli5_what_are_neural_networks/",
    //       snippet:
    //         "Neural networks are a method of machine learning that tries to mimic how a brain would work. It's made up of nodes.",
    //       date: "2 years ago",
    //       position: 4,
    //     },
    //     {
    //       title: "What is a Neural Network?",
    //       link: "https://aws.amazon.com/what-is/neural-network/",
    //       snippet:
    //         "A neural network is a method in artificial intelligence (AI) that teaches computers to process data in a way that is inspired by the human brain.",
    //       position: 5,
    //     },
    //     {
    //       title: "Explained: Neural networks",
    //       link: "https://news.mit.edu/2017/explained-neural-networks-deep-learning-0414",
    //       snippet:
    //         "Neural nets are a means of doing machine learning, in which a computer learns to perform some task by analyzing training examples.",
    //       date: "Apr 14, 2017",
    //       position: 6,
    //     },
    //     {
    //       title: "Neural Networks Explained in 5 minutes",
    //       link: "https://www.youtube.com/watch?v=jmmW0F0biz0",
    //       snippet:
    //         "Neural networks reflect the behavior of the human brain allowing computer programs to recognize patterns and solve common problems.",
    //       date: "3 years ago",
    //       position: 7,
    //     },
    //     {
    //       title: "What is a neural network? | Types of neural networks",
    //       link: "https://www.cloudflare.com/learning/ai/what-is-neural-network/",
    //       snippet:
    //         "A neural network is a computational system inspired by the human brain that learns to perform tasks by analyzing examples. It consists of interconnected nodes ...",
    //       position: 8,
    //     },
    //     {
    //       title: "What Is a Neural Network? - MATLAB & Simulink",
    //       link: "https://www.mathworks.com/discovery/neural-network.html",
    //       snippet:
    //         "A neural network (also called an artificial neural network or ANN) is an adaptive system that learns by using interconnected nodes or neurons in a layered ...",
    //       position: 9,
    //     },
    //     {
    //       title: "Neural Networks: What are they and why do they matter?",
    //       link: "https://www.sas.com/en_us/insights/analytics/neural-networks.html",
    //       snippet:
    //         "Neural networks are computing systems with interconnected nodes that work much like neurons in the human brain.",
    //       position: 10,
    //     },
    //   ],
    //   credits: 1,
    // };

    const LinksToFetch = FilterUrlForExtraction(response, req.user);

    // console.log(LinksToFetch);

    if (LinksToFetch.length === 0) {
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }

    const CleanedWebData = await ProcessForLLM(
      LinksToFetch,
      req.user,
      question
    );

    if (CleanedWebData.length === 0) {
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }
    const WebResults = FormattForLLM(CleanedWebData);

    if (WebResults?.error || WebResults.FinalContent.length === 0) {
      // console.log(WebResults.error);
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }

    const message = {
      id: userMessageId, //users message Id
      sent_by: "You", //sent by the user
      message: { isComplete: true, content: question },
      sent_at: currentTime,
    };
    // update the cache
    await CacheCurrentChat(message, req.user);
    const WebResultPrompt = WEB_SEARCH_DISTRIBUTOR_PROMPT;

    let Answer = await GenerateResponse(
      question,
      JSON.stringify(WebResults.FinalContent),
      WebResultPrompt,
      req.user
    );
    if (Answer.error) {
      return res.status(400).send({ message: "Server busy" });
    }

    const AiMessage = {
      id: MessageId,
      sent_by: "AntiNode", //sent by the user
      message: {
        isComplete: true,
        content: Answer,
      },
      sent_at: currentTime,
    };
    // update the cache
    await CacheCurrentChat(AiMessage, req.user);

    // store in the db
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
        AI_response: Answer,
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
      icon: WebResults.favicons,
      url: WebResults.urls, //favicon array from the web search
    };

    // //  now that we have generated all the response and data for the user
    // // we need to check if the user is within the credit limit or does even has a record in db and cache
    // //if true we update the value in both else we create a new record

    return res.send({
      Answer: Answer || JSON.stringify(WebResults.FinalContent),
      message: "Results found",
      favicon: FormattedFavicon,
      urls: WebResults.urls || [],
    });
  } catch (err) {
    await notifyMe(
      "An error occured in the postTypewebsearch controller function",
      err
    );
    console.error(err);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

// extract text from the chunks based on the chunk Ids
export async function getAllDocumentTextsForSummary(docId, totalChunks) {
  // console.log(docId, username, title, totalChunks)
  if (!docId || !totalChunks) {
    console.warn(`No chunks to fetch for document: ${docId}`);
    return [];
  }

  // Step 1: Generate all the chunk IDs based on the count from Supabase.
  const allChunkIds = [];
  let chunkId;
  for (let i = 0; i < totalChunks; i++) {
    // console.log("Running the id creattion loop")
    chunkId = `id=${docId.trim()}:chunkcount=${i}`;
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
      return { error: "Invalid arguments" };
    }

    const { data, error } = await supabase.from("Conversation_History").insert({
      user_id: user_id,
      question: question,
      AI_response: Ai_response,
      document_id: docId,
    });
    // .select();
    // .single();
    if (error) {
      console.error(
        "Error while storing the session data in the database:",
        error
      );
      return { error: "Error while storing the session data in the database" };
    }
    return { message: "Stored successfully", insertData: data };
  } catch (error) {
    console.error("Error while storing the session information:", error);
    return { error: "Could not store the session information" };
  }
};

//helper function to delete file data
const deleteFileData = async (document_id, user) => {
  const { error: ChatHistoryDelError } = await supabase
    .from("Conversation_History")
    .delete()
    .eq("document_id", document_id);
  if (ChatHistoryDelError) {
    return {
      error: "An error occured while deleting the document chat history",
    };
  }

  // deleting  from contributions
  const { error } = await supabase
    .from("Contributions")
    .delete()
    .eq("document_id", document_id);

  if (error) {
    return {
      error: "An error occured while deleting your file , please try again",
    };
  }
  // deleting the chunks of file from the vector database;
  try {
    const deletingFile = await index.deleteMany({
      documentId: document_id,
    });
  } catch (deletingFromVectorDbError) {
    return { error: "Error while deleting your document." };
  }
};
