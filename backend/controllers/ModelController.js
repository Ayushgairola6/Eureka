import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { SYNTHESIS_PROMPT } from "../Prompts/Prompts.js";
export const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const pc = new Pinecone({
  apiKey: process.env.PINECONE_DB_API_KEY,
});

export const GenerateResponse = async (
  question,
  FormattedString,
  SYSTEM_PROMPT,
  PaymentStatus
) => {
  try {
    if (!question || !FormattedString || !SYSTEM_PROMPT) {
      return { error: "Some parameters are missing" };
    }

    const FinalString = SYSTEM_PROMPT + FormattedString;
    // calculating the tokens the stirng will cost
    const EstimattedTokens = await genAI.models.countTokens({
      model: "gemini-2.5-flash-lite",
      contents: FinalString,
    });

    if (!EstimattedTokens) {
      return { message: "An error occured while generating a response" };
    }
    // send the results to me for
    await notifyMe(
      `New repsonse generated with token cose of =`,
      EstimattedTokens.totalTokens
    );
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: FinalString }] }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: PaymentStatus === false ? 400 : 1000,
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
    // return { error: "Testing out the error fallback function" };
    return responseText;
  } catch (error) {
    console.log(error);
    return { error: "Error while generating a response by the model" };
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
  user
) => {
  try {
    const FinalString = `${SYNTHESIS_PROMPT} userQuery=${question} ContextBegins from here=>${ContextString}`;
    const EstimattedTokens = await genAI.models.countTokens({
      model: "gemini-2.5-flash-lite",
      contents: FinalString,
    });

    if (!EstimattedTokens) {
      return { message: "An error occured while generating a response" };
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: FinalString }] }],
      generationConfig: {
        temperature: 0.5,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: user.PaymentStatus === false ? 400 : 1000,
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
