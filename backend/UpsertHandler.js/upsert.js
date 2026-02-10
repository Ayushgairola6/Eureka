// import { InsertRecords } from "../controllers/fileControllers.js";
// import {
//   generateEmbedding,
//   generateEmbeddingsWithGoogle,
// } from "../embeddings/Embeddings.js";

// export async function UpsertDocs(
//   user,
//   chunksArray,
//   recordsToUpsert,
//   documentId,
//   visibility,
//   subCategory,
//   category,
//   batchSize,
//   filename,
//   chunkNumber
// ) {
//   if (chunksArray.length === 0) {
//     return { message: "The chunks array is empty" };
//   }

//   // 1. --- BATCHED INFERENCE (MASSIVE SPEEDUP) ---
//   // If generateEmbedding is refactored to accept an array and returns an array of embeddings
//   const textEmbeddings = await ProcessEmbeddinBatching(user, chunksArray);
//   if (textEmbeddings.length === 0) {
//     console.error("Error while generating embeddings-> the array is empty");
//     return { message: "Error while generating embeddings" };
//   }

//   //create records for db to upsert
//   const recordsForDb = [];

//   const upsertionBatchSize = user.PaymentStatus === false ? 20 : 30;
//   for (let i = 0; i < chunksArray.length; i++) {
//     // We can now guarantee that allEmbeddings[i] corresponds to chunksArray[i]

//     const chunkId = `${documentId.trim()}part:${filename
//       .trim()
//       .toUpperCase()}:${i}`;

//     const chunkInfo = {
//       chunk_id: chunkId,
//       content: chunksArray[i],
//       document_id: documentId,
//       category: category,
//       subCategory: subCategory,
//       embeddings: textEmbeddings[i], // Use the pre-calculated embedding
//       visibility: visibility,
//     };

//     recordsForDb.push(chunkInfo);

//     // 3. --- DATABASE BATCHING ---
//     if (recordsForDb.length === batchSize) {
//       try {
//         // Send the entire batch of 50-90 records to the DB in a single call
//         const results = await InsertRecords(recordsForDb);

//         if (
//           results.message &&
//           results?.message.trim().toLowerCase().includes("failed")
//         ) {
//           return { message: "failed" };
//         }
//         // Clear the batch for the next set
//         recordsForDb.length = 0;
//       } catch (upsertError) {
//         return { message: "failed" };
//       }
//     }
//   }
//   return { message: "Upserted" };
// }

// // 1. Helper function to pause execution (The "Sleep" function)
// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// //procssing tokens in batchs
// async function ProcessEmbeddinBatching(user, TextArray) {
//   const batchSize = user.PaymentStatus === false ? 5 : 10;

//   const finalEmbeddings = [];

//   // 2. Loop through the array in chunks (steps of batchSize)
//   for (let i = 0; i < TextArray.length; i += batchSize) {
//     // Slice creates a new array from index i to i + batchSize
//     const batch = TextArray.slice(i, i + batchSize);

//     try {
//       console.log(
//         `Processing batch ${i / batchSize + 1} of size ${batch.length}...`
//       );

//       // 3. Send ONLY the current batch
//       const generatedEmbeddings = await generateEmbeddingsWithGoogle(batch);

//       if (generatedEmbeddings && generatedEmbeddings.length > 0) {
//         // 4. Extract values correctly (assuming Google returns object with .values or .embedding)
//         // Adjust this depending on exactly what generateEmbeddingsWithGoogle returns
//         generatedEmbeddings.forEach((item) => {
//           // If your helper returns the raw API response object:
//           if (item.values) finalEmbeddings.push(item.values);
//           // If your helper returns just the embedding array directly:
//           else finalEmbeddings.push(item);
//         });
//       }
//       console.log("Cooling down for 3 seconds...");
//       await sleep(3000);
//     } catch (error) {
//       console.error(`Error processing batch starting at index ${i}:`, error);
//       // Decide if you want to throw the error or continue to the next batch
//       // throw error;
//     }
//   }

//   return finalEmbeddings;
// }
