import { GenerateResponse } from "../controllers/ModelController.js";
import { supabase } from "../controllers/supabaseHandler.js";
import {
  getAllDocumentTextsForSummary,
  index,
  splitTextIntoChunks,
  StoreContributionDetails,
  StoreQueryAndResponse,
} from "../controllers/fileControllers.js";
import { v4 as uuidv4 } from "uuid";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { CheckFileTypeAndParseIt } from "../FilerParsers/FilerParser.js";
import {
  formatForGemini,
  FormatForHumanFallback,
  SearchQueryResults,
} from "../OnlineSearchHandler/WebSearchHandler.js";

// Find the detail of users private documents (WOrkding fine)
export const GetUserDocuments = async (req, res) => {
  try {
    const user = req.user;
    // req.user is the user_id here
    if (!user) {
      return res.status(404).json({
        message: "Invalid user please check your API key before proceeding",
      });
    }
    // get all type of user documents private or public
    const { data, error } = await supabase
      .from("Contributions")
      .select("*")
      .eq("user_id", user.user_id);

    if (error) {
      await notifyMe(
        "An error has occured while checking document data for user =",
        user
      );
      return res
        .status(404)
        .json({ message: "Error while finding your documents " });
    }

    return res.status(200).json({
      documents: data,
      message: `These are all you documents`,
      count: data.length || 0,
    });
  } catch (getdocumenterror) {
    console.error(getdocumenterror);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Query an individual document
export const QuerySpecificDocument = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).send({ message: "Please login to continue" });
    }

    const { document_id, question, query_type } = req.body;

    if (
      !document_id ||
      typeof document_id !== "string" ||
      !question ||
      typeof question !== "string" ||
      !query_type ||
      typeof query_type !== "string"
    ) {
      await notifyMe(
        `Error while asking question from private doc by user=${user} the req.body is like this = ${JSON.stringify(
          req.body
        )}`
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
          topK: 50,
          inputs: { text: question },
          filter: {
            documentId: { $eq: document_id },
            visibility: { $eq: "Private" },
          },
        },
        fields: ["text", "category", "subCategory"],
      });

      if (response.result.hits.length === 0) {
        return res.status(200).send({
          message: "Results not found",
          Answer:
            "I was unable to find anything related to you question in your document . If you could be more specific about what you want to know about this document I will be able to assist you properly.",
        });
      }
    }
    // if the query is summary type
    else if (query_type === "Summary") {
      const { data, error } = await supabase
        .from("Contributions")
        .select("title , chunk_count ,username")
        .eq("document_id", docId);

      if (error || !data.length === 0) {
        await notifyMe(
          "something went wrong in the querySpecific doucmnet controller for sdk",
          error
        );
        return res
          .status(400)
          .send({ message: "Error while generating a response" });
      }

      //   getting the summary for document
      response = await getAllDocumentTextsForSummary(
        docId,
        data[0].username,
        data[0].title,
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
          FoundData.push({
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
      SYSTEM_PROMPT,
      user
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
      document_id
    );

    if (storeResponse.error) {
      await notifyMe(`Error while storing message  ${storeResponse.error}`);
    }

    return res.status(200).send({
      message: "Response found",
      Answer: AnswerToUsersQuestion,
    });
  } catch (error) {
    console.error(error);
  }
};

// Store a particular document
export const StoreDocument = async (req, res) => {
  try {
    const { category, title, subCategory, visibility } = req.body;
    const file = req.file;
    const user = req.user;
    if (!user) {
      return res.status(400).json({ message: "Please Login to continue ." });
    }
    const email = user.users.email;
    if (!category || typeof category !== "string") {
      return res.status(400).json({ message: "Invalid category" });
    }
    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Invalid title" });
    }
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (
      !file ||
      (typeof file !== "object" && typeof file !== "string") ||
      (file instanceof Buffer && file.length === 0)
    ) {
      return res.status(400).json({ message: "Invalid file" });
    }
    if (!subCategory || typeof subCategory !== "string") {
      return res.status(400).json({ message: "Invalid subCategory" });
    }
    if (
      !visibility ||
      typeof visibility !== "string" ||
      !["Public", "Private"].includes(visibility)
    ) {
      return res.status(400).json({
        message:
          "The visibility can either be 'Public' or 'Private' it is a case sensitive field",
      });
    }

    // unique id for uploaded document
    const documentId = uuidv4();

    // checking the file type
    const CheckedFileType = await CheckFileTypeAndParseIt(file);
    if (!CheckedFileType || CheckedFileType?.error) {
      return res.status(400).json({
        message:
          CheckedFileType.error ||
          "Looks like this file type is not supported at the moment , you can check you documentation to see what type of documents are accepted currently .",
      });
    }
    // split the text into smaller chunks
    const textChunks = await splitTextIntoChunks(CheckedFileType);

    if (!textChunks || textChunks.length === 0) {
      await notifyMe(`Error while chunking the text by ${user.users.username}`);
      return res
        .status(400)
        .json({ message: "Error while processing your file" });
    }
    // number of chunks
    let chunkNumber;
    // array to store a unique record array for upsert operation
    const recordsToUpsert = [];
    // the size of one batch that we process
    const batchSize = 90; //batch range we store currently at single time

    for (let i = 0; i < textChunks.length; i++) {
      chunkNumber = i;
      //   a unique id of chunk only thing different in each
      const chunkId = `${documentId.trim()}:${user.users.username.trim()}:${title.trim()}:${chunkNumber}`;

      // pushing the chunk data in formatted way to store in the db
      recordsToUpsert.push({
        id: chunkId,
        text: textChunks[i],
        visibility: visibility,
        category: category,
        subCategory: subCategory,
        date_of_contribution: new Date().toISOString(),
        documentId: documentId,
        contributor: user.user_id,
      });

      // If batch is full or it's the last chunk, upsert the batch
      if (recordsToUpsert.length === batchSize || i === textChunks.length - 1) {
        try {
          await index.upsertRecords(recordsToUpsert); // Pass the array of records
          // console.log(`Upserted batch of ${recordsToUpsert.length} records.`);
          recordsToUpsert.length = 0; // Clear the batch array
        } catch (error) {
          await notifyMe(
            `Error ${error} while batch upsert the file by ${user.users.username}`
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
      title,
      user.user_id,
      visibility,
      documentId,
      chunkNumber
    );

    if (StoredContribution?.error) {
      await notifyMe(StoredContribution.error);
      return res.status(400).json({ message: StoredContribution.error });
    }

    return res.status(200).json({
      message: "Upload successfull",
      chunksCreated: chunkNumber,
    });
  } catch (error) {
    await notifyMe(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
const simulateEmbeddingGeneration = async (textChunks) => {
  console.log("Simulating embedding generation...");

  // Simulate processing time based on chunk count (similar to real API)
  const processingTime = textChunks.length * 100; // 100ms per chunk
  await new Promise((resolve) => setTimeout(resolve, processingTime));

  console.log(`Simulated embedding generation for ${textChunks.length} chunks`);
  return true;
};

// To handle web Search
export const SdkWebSearchHandler = async (req, res) => {
  try {
    const user = req.user;
    if (!user.user_id)
      return res.status(401).send({ message: "Please login to continue" });
    const { question } = req.body;
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

    const StoreChats = await StoreQueryAndResponse(
      user.user_id,
      question,
      Answer
    );
    if (StoreChats.error) {
      await notifyMe(
        `Error while storing response history ${StoreChats.error}`
      );
    }

    const FormattedFavicon = {
      MessageId,
      icon: WebResults.favicon || [],
    };

    return res.send({
      Answer: Answer,
      message: "These results were found on the web",
      favicon: FormattedFavicon,
    });
  } catch (err) {
    await notifyMe(err);
    return res.status(500).send({ message: "Something went wrong" });
  }
};
