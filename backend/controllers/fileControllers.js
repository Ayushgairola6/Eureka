import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import {
  FilterIntent,
  FindIntent,
  GenerateEmbeddings,
  GenerateResponse,
} from "./ModelController.js";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabaseHandler.js";
import {
  CheckFileTypeAndParseIt,
  HandleSourceCreation,
  processContextStringCreation,
} from "../FilerParsers/FilerParser.js";
dotenv.config();

import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import {
  CacheCurrentChat,
  redisClient,
  UpdateTheNotificationCache,
  UpdateUserFileListCacheInfo,
} from "../CachingHandler/redisClient.js";
import { EmitEvent } from "../websocketsHandler.js/socketIoInitiater.js";
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
import { HandleDeepWebResearch } from "./FeaturesController.js";
import { CheckUserPlanStatus } from "../Middlewares/AuthMiddleware.js";
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

    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      req.user.user_id
    );

    if (status === false || error || !plan_type) {
      return res
        .status(400)
        .send({ message: "Something went wrong on the server side" });
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

    // limit of texts for free  users
    if (
      plan_status === "active" &&
      plan_type === "free" &&
      textChunks.length > 25
    ) {
      return res.status(400).send({
        message: "Purchase our premium to be able to upload large documents.",
      });
    }

    // check private doc counts for free and sprint pass users
    if (
      plan_status === "active" &&
      (plan_type === "free" || plan_type === "sprint pass")
    ) {
      const checkUpperBound = await CheckUserContributionCount(
        req.user,
        plan_type,
        plan_status
      );

      if (checkUpperBound && checkUpperBound.message === "Limit reached") {
        return res.status(400).send({
          message: `You've reached your limit of 2 private documents for the free tier. Upgrade your plan to upload more and unlock additional features.`,
        });
      }
    }

    // random id for the doc
    let chunkNumber;
    // array to store a unique record array for upsert operation
    const recordsToUpsert = [];

    //upload batch size to avoid overwhelming database
    const batchSize =
      plan_type === "free"
        ? parseInt(process.env.CLOUD_UPLOAD_BATCH_SIZE_FREE)
        : plan_type === "sprint"
        ? parseInt(process.env.CLOUD_UPLOAD_BATCH_SIZE_SPRINT_PASS)
        : parseInt(process.env.CLOUD_UPLOAD_BATCH_SIZE_OTHERS);
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
    await notifyMe("Error in file upload handler", error);
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
    "\n\n--- PAGE BREAK ---\n\n",
    "\n\n",
    "\n",
    ". ",
    "? ",
    " ",
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
    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      user_id
    );

    if (status === false || error || !plan_type) {
      return res
        .status(400)
        .send({ message: "Something went wrong on the server side" });
    }

    // update the daily quota of the user
    const UpdateState = await ProcessUserQuery(req.user, "Public");

    // if user has reached the
    if (UpdateState?.status === false) {
      return res.status(200).send({
        answer: UpdateState.message,
        message: "Todays quota has finished!",
        docUsed: [],
      });
    }

    // finding info regarding that query

    let DocumentsUserForReference;
    //    console.log(fetchResult)
    const response = await index.searchRecords({
      query: {
        topK:
          plan_type === "free" ? 50 : plan_type === "sprint pass" ? 100 : 500,
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
        plan_type,
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
      req.user,
      plan_type
    );

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
        await redisClient
          .multi()
          .set(misallaneousChatsKey, JSON.stringify(newChats))
          .expire(misallaneousChatsKey, 500);
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
    if (!user || !user?.user_id) {
      return res.status(401).send({ message: "Please login to continue" });
    }

    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      user.user_id
    );
    //if the user is not paid or the paid staus is not even available
    if (error || status === false || !plan_type) {
      console.log(
        status,
        error,
        plan_type,
        plan_status,
        "these are the plan data of this account"
      );
      return res.status(400).send({
        message:
          "There is something wrong with your account please contact our support at support@antinodeai.space to invoke a problem ticket.",
      });
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
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: `Checking_Plan`,
        data: [
          `I found out that ${user.username} is on ${plan_type} plan currently`,
        ],
      },
    });
    // if the user plan is of free or sprint pass type
    if (
      plan_status === "active" &&
      (plan_type === "free" || plan_type === "sprint pass") &&
      query_type === "Summary"
    ) {
      return res.status(402).send({
        message:
          "You need an active plan in order to be able to access this feature",
      });
    }

    //  setting the specific headers for stream type
    // check the current credit limit record for the user
    const UpdateState = await ProcessUserQuery(req.user, "ask_private");
    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: `Checking_Quota`,
        data: [`I am now checking the users quota`],
      },
    });
    // if user has reached the
    if (UpdateState?.status === false) {
      return res.status(200).send({
        Answer:
          "You have exhausted your monthly quota, please wait till next month or get our premium membership and enjoy unlimited researching",
        message: "Todays quota has finished!",
        docUsed: [],
      });
    }

    let response;

    const SYSTEM_PROMPT =
      query_type === "QNA"
        ? KNOWLEDGE_DISTRIBUTOR_PROMPT
        : query_type === "Summary"
        ? SUMMARIZATION_ANALYST_PROMPT
        : WEB_SEARCH_DISTRIBUTOR_PROMPT;

    EmitEvent(user.user_id, "query_status", {
      MessageId,
      status: {
        message: `Understanding_Intent`,
        data: [`${user.username} wants me to ${query_type} the prompt `],
      },
    });
    // if the query is of qna type
    if (query_type === "QNA") {
      response = await index.searchRecords({
        query: {
          topK:
            plan_type === "free" ? 50 : plan_type === "sprint pass" ? 100 : 500, //quota based system
          inputs: { text: question },
          filter: {
            documentId: { $eq: docId },
            visibility: { $eq: "Private" },
          },
        },
        fields: ["text"],
      });

      EmitEvent(user.user_id, "query_status", {
        MessageId,
        status: {
          message: `Searching_Records`,
          data: [`I am now search records for the user request`],
        },
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
      const { data, error } = await supabase
        .from("Contributions")
        .select(" chunk_count")
        .eq("document_id", docId);

      if (error || !data.length === 0) {
        return res
          .status(400)
          .send({ message: "Error while generating a response" });
      }

      EmitEvent(user.user_id, "query_status", {
        MessageId,
        status: {
          message: `Found_Chunk_Count`,
          data: [
            `Found ${data[0].chunk_count} number of chunks in the records and now I am reading them`,
          ],
        },
      });
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
            EmitEvent(user.user_id, "query_status", {
              MessageId,
              status: {
                message: `Reading docs`,
                data: [
                  `<>score=${
                    rest._score
                  }<> Context===>${rest?.fields?.text.slice(0, 200)}`,
                ],
              },
            });
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
        EmitEvent(user.user_id, "query_status", {
          MessageId,
          status: {
            message: `Reading docs`,
            data: [str?.slice(0, 200)],
          },
        });
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
      user,
      plan_type
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
      await redisClient
        .multi()
        .set(DocumentChatCacheKey, JSON.stringify(newChats))
        .expire(DocumentChatCacheKey, 1000);
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

    const { question, MessageId, userMessageId, web_search_depth } = req.body;
    if (
      !question ||
      typeof question !== "string" ||
      !MessageId ||
      typeof MessageId !== "string" ||
      !userMessageId ||
      typeof userMessageId !== "string" ||
      !web_search_depth ||
      typeof web_search_depth !== "string"
    )
      return res.status(404).send({
        message:
          "Some parameters are missing,this is a server side issue please wait till we resolve this problem.",
      });

    // check user plan status
    const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
      user_id
    );

    //if the user is not paid or the paid staus is not even available
    if (status === false || error || !plan_type) {
      return res.status(400).send({
        message:
          "There is something wrong with your account please contact our support at support@antinodeai.space to invoke a problem ticket.",
      });
    }

    // if the user is on free plan and is asking for deep_web_search
    if (
      plan_type === "free" &&
      plan_status === "active" &&
      web_search_depth === "deep_web"
    ) {
      return res.status(400).send({
        message:
          "This feature is only available for pro members ,if you want to surf the deep web get our premium subscriptio to enjoy research with deep web results.",
      });
    }
    let InDepthQueries = [];

    // check the quota status of the user
    const UpdateState = await ProcessUserQuery(req.user, "web_search");

    // if user has reached the
    if (UpdateState?.status === false) {
      return res.status(400).send({
        Answer:
          "You have exhausted your monthly quota please wait till next month or get our premium pass to enjoy unlimited research",
        message:
          "You have exhausted your monthly quota please wait till next month or get our premium pass to enjoy unlimited research",
        favicons: { MessageId, icon: [] },
      });
    }

    let WebResults;
    // iof the user is not on premium and is asking for deep_search we simply reject their request

    //if the user is paid and is asking for deep_search we process further
    if (
      plan_status &&
      plan_status === "active" &&
      web_search_depth &&
      web_search_depth === "deep_web"
    ) {
      EmitEvent(user_id, "query_status", {
        MessageId,
        status: {
          message: `Understanding_Intent`,
          data: [`I am now Breaking down ${req.user.username}'s intent`],
        },
      });
      // break the query into subquries for deep_research and google dorking stuff
      const IdentifyUserIntent = await FindIntent(IntentIdentifier, question);

      if (IdentifyUserIntent?.error) {
        return res.status(400).send({
          message:
            "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
        });
      }

      // convert the queries into a series of array of strings
      const FormattedQueries = FilterIntent(IdentifyUserIntent); //create an array of quries

      console.log(
        "These are the intents identified by the model of the user prompt\n",
        FormattedQueries
      );
      if (
        !Array.isArray(FormattedQueries) ||
        FormattedQueries?.error ||
        FormattedQueries?.length === 0
      ) {
        return res.status(400).send({
          message:
            "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
        });
      }
      InDepthQueries = [...FormattedQueries];
      EmitEvent(user_id, "query_status", {
        MessageId,
        status: {
          message: `Crawling_deep_web`,
          data: [
            `Crawling deep web for following queries ,${JSON.stringify(
              FormattedQueries
            )}`,
          ],
        },
      });

      // send queries to the crawler to scrape
      const FinalLinksToScrape = await HandleDeepWebResearch(
        FormattedQueries,
        req.user,
        null,
        MessageId,
        plan_type
      );

      if (FinalLinksToScrape?.length === 0) {
        return res.status(400).send({
          message:
            "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
        });
      }

      // parse the results and extract organic results and convert it into an array of link(string)
      let LinksToFetch = [];
      // handle each source links extraction
      FinalLinksToScrape.forEach((li) => {
        if (li) {
          const data = FilterUrlForExtraction(li, req.user);
          LinksToFetch.push(data);
        }
      });

      // as the results array will be nested we flat it
      const FlatLinks = LinksToFetch.flat();

      if (FlatLinks.length === 0) {
        return res
          .status(400)
          .send({ message: "An error occured while processing your request" });
      }
      // generate embeddings for the user prompt
      const UserPromptEmbeddings = await GenerateEmbeddings(question);

      if (UserPromptEmbeddings.error) {
        return res.status(400).send({
          message:
            "There was an error while generating embeddings for your prompt please try again.",
        });
      }
      // web send the links to the crawler to scrape and process
      const CleanedWebData = await ProcessForLLM(
        FlatLinks,
        req.user,
        question,
        MessageId,
        null,
        UserPromptEmbeddings
      );

      if (!CleanedWebData || CleanedWebData.length === 0) {
        return res
          .status(400)
          .send({ message: "An error occured while processing your request" });
      }

      // we put the results in the webResults array
      WebResults = FormattForLLM(CleanedWebData);
    }
    // if user is on surface web so we keep it simple
    else {
      // send the query direct to serper.dev
      const response = await GetDataFromSerper(question, req.user);

      if (!response) {
        return res
          .status(400)
          .send({ message: "An error occured while processing your request" });
      }

      // convert the results into array of links
      const LinksToFetch = FilterUrlForExtraction(response, req.user);

      if (LinksToFetch.length === 0) {
        return res
          .status(400)
          .send({ message: "An error occured while processing your request" });
      }
      // const LinksToFetch = [
      //   `https://www.linkedin.com/pulse/from-code-customers-4-go-to-market-strategy-examples-solo-chamaki-hhzic`,
      //   `https://marketingcrafted.com/playbooks/saas-marketing-strategy`,
      //   `https://solomarketing.tools/blog/5-marketing-tactics-solo-founders`,
      //   `https://bitbytetechnology.com/blog/saas-marketing-strategy-for-founders/`,
      //   `https://unbounce.com/general-marketing/saas-marketing-strategies/`,
      // ];

      // for paid users use embeddings method
      // const UserPromptEmbeddings = await GenerateEmbeddings(
      //   question,
      //   "RETRIEVAL_QUERY"
      // );

      // if (UserPromptEmbeddings.error) {
      //   return res.status(400).send({
      //     message:
      //       "There was an error while generating embeddings for your prompt please try again.",
      //   });
      // }
      // scrape and optimize the context for the llm
      const CleanedWebData = await ProcessForLLM(
        LinksToFetch,
        req.user,
        question,
        MessageId,
        null
        // UserPromptEmbeddings
      );

      if (CleanedWebData.length === 0) {
        console.error("Error in llm processing handler");
        notifyMe("Error in llm processing handler");
        return res
          .status(400)
          .send({ message: "An error occured while processing your request" });
      }
      // give it to the model
      WebResults = FormattForLLM(CleanedWebData);
    }

    // get necessary links from serper

    if (
      !WebResults ||
      WebResults?.error ||
      WebResults?.FinalContent?.length === 0
    ) {
      console.error("no web results found", WebResults?.error);
      notifyMe("No web results found", WebResults?.error);
      return res
        .status(400)
        .send({ message: "An error occured while processing your request" });
    }
    // extract chat history for a bit of memory from past
    let history = [];
    const pastConversation = await GetChatsForContext(req.user);
    if (!pastConversation || pastConversation.length === 0) {
      history.push(`Failed to get session chat history`);
    } else {
      history = [...pastConversation];
    }

    const message = {
      id: userMessageId, //users message Id
      sent_by: "You",
      message: { isComplete: true, content: question },
      sent_at: currentTime,
    };
    // update the cache
    await CacheCurrentChat(message, req.user);
    const WebResultPrompt = WEB_SEARCH_DISTRIBUTOR_PROMPT;

    let Answer = await GenerateResponse(
      InDepthQueries.length > 0
        ? `These are subqueries obtained by understanding the user request created by you earlier use these within your response to make your research to be authentic=${JSON.stringify(
            InDepthQueries
          )}&UserQuery=${question}`
        : question,
      JSON.stringify(WebResults.FinalContent),
      WebResultPrompt,
      req.user,
      plan_type
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
    const FormattedFavicon = {
      MessageId,
      icon: WebResults.favicons,
      url: WebResults.urls, //favicon array from the web search
    };

    // send the final response to the user
    return res.send({
      Answer: Answer,
      message: "Results found",
      favicon: FormattedFavicon,
    });
  } catch (err) {
    await notifyMe(
      "An error occured in the postTypewebsearch controller function filecontroller.js line 1204",
      err
    );

    return res.status(500).send({
      message:
        "This is a server side error please wait while we are fixing this problem, thanks for your patience.",
    });
  }
};

// extract text from the chunks based on the chunk Ids
export async function getAllDocumentTextsForSummary(docId, totalChunks) {
  // console.log(docId, username, title, totalChunks)
  if (!docId || !totalChunks) {
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
