import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import {
  CHAT_HISTORY_SUMMARIZER_PROMPT,
  SYNTHESIS_PROMPT,
} from "../Prompts/Prompts.js";
import { index, pc } from "./fileControllers.js";
import { redisClient } from "../CachingHandler/redisClient.js";
import { supabase } from "./supabaseHandler.js";
export const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

export const GenerateResponse = async (
  question,
  FormattedString,
  SYSTEM_PROMPT,
  user
) => {
  try {
    if (!question || !FormattedString || !SYSTEM_PROMPT) {
      return { error: "Some parameters are missing" };
    }

    // console.log(FormattedString);
    // const FinalString = SYSTEM_PROMPT + FormattedString;

    const result = await genAI.models.generateContent({
      model:
        user.PaymentStatus === false
          ? "gemini-2.5-flash-lite"
          : "gemini-2.0-pro-exp",
      contents: [
        { role: "model", parts: [{ text: "Sytem_prompt:" + SYSTEM_PROMPT }] },
        {
          role: "user",
          parts: [{ text: `userquery=${question}&Context${FormattedString}` }],
        },
      ],
      generationConfig: {
        temperature: user.PaymentStatus === false ? 0.5 : 1,
        topP: 0.95,
        topK: user.PaymentStatus === false ? 40 : 80,
        maxOutputTokens: user.PaymentStatus === false ? 2000 : 3000,
      },
      config: {
        thinkingConfig: {
          //if user is paid enable it else false
          includeThoughts: user.PaymentStatus === true ? true : false,
        },
      },
    });

    const responseText = result.text;
    if (!responseText) {
      await notifyMe(
        `Error while generating a response , the code execution results are these`,
        JSON.stringify(result.codeExecutionResult)
      );
      return { error: "The server is very busy , please try again !" };
    }
    // const responseText = FormattedString;
    // return { error: "Testing out the error fallback function" };
    return responseText;
  } catch (error) {
    console.error(error);
    return { error: "Error while generating a response by the model" };
  }
};
export const IdentifyUserRequest = async (context, prompt) => {
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        { role: "model", parts: [{ text: prompt }] },
        { role: "user", parts: [{ text: context }] },
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 10,
        maxOutputTokens: 500, ///maximum 300 characters output
      },
    });

    const responseText = result.text;
    return responseText;
  } catch (error) {
    return { error: error };
  }
};
export const GenerateEmbeddings = async (file_content) => {
  try {
    if (!file_content || typeof file_content !== "string") {
      return { error: "Invalid content type" };
    }

    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: file_content,
      config: {
        taskType: "SEMANTIC_SIMILARITY",
      },
    });

    // console.log(response.embeddings);
    if (!response.embeddings) {
      return { error: "Error while generating embeddings for chunks" };
    }

    return response.embeddings;
  } catch (error) {
    // console.error(error);
    return { error: "Error while Generated embeddings", error };
  }
};

const createIndex = async () => {
  try {
    const documentId = uuidv4();
    await pc.createIndexForModel({
      name: "knowledge-base-index",
      cloud: "aws",
      region: "us-east-1",
      embed: {
        model: "llama-text-embed-v2",
        fieldMap: { text: "text" },
      },
    });

    await pc.index("knowledge_base_index").configureIndex({
      indexed: [
        "category",
        "doc_id",
        "chunk_index",
        "email",
        "name",
        "upload_date",
      ],
    });
  } catch (error) {
    console.error(error);
  }
};
// createIndex()

//function that handles response generation for SynthesisMode
export const SynthesisResponseGenerator = async (
  ContextString,
  question,
  user,
  synthesisPrompt
) => {
  try {
    if (typeof ContextString !== "string") {
      return { error: "Model only accepts string as a source of information" };
    }
    const FinalString = `userQuery=${question} ContextBegins from here=>${ContextString}`;

    const result = await genAI.models.generateContent({
      model:
        user.PaymentStatus === false
          ? "gemini-2.5-flash-lite"
          : "gemini-2.0-pro-exp",
      contents: [
        {
          role: "model",
          parts: [{ text: "System Instructions: " + synthesisPrompt }],
        },
        { role: "user", parts: [{ text: FinalString }] },
      ],
      generationConfig: {
        temperature: user.PaymentStatus ? 0.7 : 0.3, // Higher temp for pro reasoning
        topP: 0.95,
        // maxOutputTokens: user.PaymentStatus ? 2000 : 1000, // Pro needs more tokens for CoT
        // If using a Thinking-enabled model:
        thinkingConfig: {
          includeThoughts: user.PaymentStatus, // Boolean
        },
      },
    });

    const responseText = result.text;
    if (!responseText) {
      console.error(result);
      await notifyMe(
        `Error while generating a response , the code execution results are these`,
        JSON.stringify(result)
      );
      return { error: "The server is very busy , please try again !" };
    }
    // return { error: "Testing out the error fallback function" };
    return responseText;
  } catch (error) {
    console.error(error);
    await notifyMe(
      "AN error occured in the sysnthesis response geenrator",
      error
    );
  }
};

export const HandleSummarizationOfChats = async (room_id, chatsArray, user) => {
  try {
    if (chatsArray.length === 0 || !Array.isArray(chatsArray)) {
      return { message: "There were no messages in the array" };
    }
    const chatIndex = await pc.index("room_chat_history");
    let Result = "";
    chatsArray.forEach(
      (li, index) =>
        (Result += `sent_by=${li.users}&sent_at=${li.sent_at}main_content=${li.message}`)
    ); //create the contexts string
    const summmary = await GenerateResponse(
      "Summarize this data",
      Result,
      CHAT_HISTORY_SUMMARIZER_PROMPT,
      user.PaymentStatus
    );

    if (!summmary || summmary.error) {
      return { message: "An error occured while creating a summary" };
    }
    const history_id = uuidv4();
    try {
      await supabase
        .from("Chat_Room_Summarized_history")
        .insert({ room_id: room_id, summary: summmary });
    } catch (upserterror) {
      return {
        message: "An error occured while inserting room session summary",
      };
    }
    const summaryKey = `room_id=${room_id}'s_summarized_history`;
    const summaryExists = await redisClient.exists(summaryKey);
    if (summaryExists) {
      const summaryArray = await redisClient.get(summaryKey);
      const parsedSummary = JSON.parse(summaryArray);
      parsedSummary.push(summmary);
      //proceed with 2 operations at once
      const multi = await redisClient
        .multi()
        .set(summaryKey, JSON.stringify(parsedSummary))
        .expire(summaryKey, 4000)
        .exec();
    }
  } catch (chatSummarizationError) {
    await notifyMe(
      "An error occured in chatHistory summarization",
      chatSummarizationError
    );
    return { message: "Something went wrong" };
  }
};

export const FindIntent = async (required_prompt, query) => {
  try {
    if (
      !required_prompt ||
      typeof required_prompt !== "string" ||
      !query ||
      typeof query !== "string"
    ) {
      return { error: "Invalid parameters to findqueryIntent" };
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        { role: "model", parts: [{ text: required_prompt }] },
        { role: "user", parts: [{ text: query }] },
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 20,
        maxOutputTokens: 300,
      },
    });

    const responseText = result?.text;
    // console.log(
    //   responseText,
    //   "The response string generated by FindIntent method"
    // );
    if (!responseText) {
      await notifyMe("Error while generating intent", JSON.stringify(result));
      return { error: "Error while finding user intent" };
    }

    return responseText;
  } catch (error) {
    await notifyMe("FindIntent exception", error);
    return { error: "Exception while finding user intent" };
  }
};

export function FilterIntent(resultstring) {
  const lists = resultstring.split(";");

  if (!lists || !lists?.length) {
    return { error: "An error occured while proceeding with your request!" };
  }
  const queries = [];
  if (lists?.length > 0) {
    lists.forEach((string) => {
      queries.push(string);
    });
  }
  return queries;
}
