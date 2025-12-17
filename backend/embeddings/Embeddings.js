// import { pipeline } from "@huggingface/transformers";
import dotenv from "dotenv";
dotenv.config();

import { genAI } from "../controllers/ModelController.js";

// class IntentGenerator {
//   static instance = null;

//   static async getInstance() {
//     if (!this.instance) {
//       // Loading once. Quantized 'fp32' or 'q8' can further save RAM
//       this.instance = await pipeline(
//         "text-generation",
//         "HuggingFaceTB/SmolLM2-135M-Instruct",
//         {
//           dtype: "q8", // 8-bit quantization drastically reduces memory
//         }
//       );
//     }
//     return this.instance;
//   }
// }
// export async function handleRequest(userInput) {
//   const generator = await IntentGenerator.getInstance();
//   const output = await generator(`Intent of: "${userInput}"\nIntent:`, {
//     max_new_tokens: 5,
//   });
//   return output[0].generated_text;
// }
// Example usage in an API route

//generates embeddings for give prompt locally
// export async function generateEmbedding(text) {
//   const extractor = await pipeline(
//     "feature-extraction",
//     "Xenova/all-MiniLM-L6-v2"
//   );

//   // Generate the embeddings.
//   // 'pooling: mean' applies mean pooling to the token embeddings.
//   // 'normalize: true' normalizes the resulting vector.
//   const result = await extractor(text, { pooling: "mean", normalize: true });

//   const finalEmbeddingsArray = Array.from(result.data); //convert to stadard js array
//   return finalEmbeddingsArray;
// }

// ///request hugging face to process the request
// // const embeddings = await client.featureExtraction({
// //   model: "sentence-transformers/all-MiniLM-L6-v2", // Or any other suitable model
// //   inputs: texts, // Pass an array of strings for batching
// //   parameters: {
// //     normalize: true,
// //     truncate: true,
// //   },
// // });
// // return embeddings;

// export const generateEmbeddingsWithGoogle = async (textArray) => {
//   const tokens = await genAI.models.countTokens({
//     model: "gemini-embedding-001",
//     contents: textArray,
//     outputDimensionality: 384,
//   });
//   console.log(
//     tokens.totalTokens.toFixed(),
//     "Tokens were used to process this huge document"
//   );

//   const result = await genAI.models.embedContent({
//     model: "gemini-embedding-001",
//     contents: textArray,
//     config: {
//       taskType: "RETRIEVAL_DOCUMENT",
//       outputDimensionality: 384,
//     },
//   });
//   // console.log(result);
//   if (result.embeddings.length === 0) {
//     return { message: "Model failed to generate embeddings" };
//   }
//   return result.embeddings;
// };
