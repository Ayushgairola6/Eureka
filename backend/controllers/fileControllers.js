import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from 'fs';
import os from 'os';
import path from 'path';
import { GenerateEmbeddings, GenerateResponse } from "./ModelController.js";
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseHandler.js'
dotenv.config()


const pc = new Pinecone({
    apiKey: process.env.PINECONE_DB_API_KEY
});

const index = pc.index("knowledge-base-index");

export const FileUploadHandle = async (req, res) => {
    try {

        const { category, name, feedback, subCategory, visibility } = req.body
        const file = req.file
        const userid = req.user.user_id;
        if (!userid) {
            return res.status(400).json({ message: "Please Login to continue ." })
        }
        const email = req.user.email;
        if (!category || typeof category !== 'string' || !name || typeof name !== 'string' || typeof name !== 'string' || typeof feedback !== 'string' || !feedback || !email || !file || !subCategory || typeof subCategory !== "string" || !visibility) {
            return res.status(400).json({ message: "Invalid data type !" })
        }
        const documentId = uuidv4();

        const StoredContribution = await StoreContributionDetails(name, email, feedback, userid, visibility, documentId);

        if (StoredContribution?.error) {
            console.log(StoredContribution?.error)
            return res.status(400).json({ message: StoredContribution.error })
        }
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        const loader = new PDFLoader(blob, {
            splitPages: false
        });

        const docs = await loader.load();
        if (!docs || !docs[0].pageContent) {
            return res.status(400).json({ message: "Error while uploading the file" })
        }

        // splitting the text into chunks

        const textChunks = await splitTextIntoChunks(docs[0].pageContent)

        if (!textChunks || textChunks.length === 0) {
            return res.status(400).json({ message: "Error while chunking the text data" })
        }
        // random id for the doc


        if (!StoredContribution || StoredContribution.error) {
            return res.status(400).json({ message: "Error while recording contribution details , please try again later !" })
        }
        // array to store a unique record array for upsert operation
        const recordsToUpsert = [];
        // the size of one batch that we process
        const batchSize = 100; // Adjust batch size based on your index type and data size

        // loop to start pushing chunks into the db
        for (let i = 0; i < textChunks.length; i++) {
            // Generate a unique ID for each chunk
            // Option 1: documentId-chunkIndex (simple)
            const chunkId = `${documentId}-${i}`;


            // pushing the chunk data in formatted way to store in the db
            recordsToUpsert.push({
                id: chunkId,
                text: textChunks[i],
                visibility: visibility,
                category: category,
                subCategory: subCategory,
                date_of_contribution: new Date().toISOString(),
                documentId: documentId,
                contributor: name
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
                    return res.status(500).json({ message: "Error during Pinecone upsert operation." });
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
                return res.status(500).json({ message: "Error during Pinecone upsert operation." });
            }
        }
        return res.json({ message: "Upload successfull" })

    }

    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server error" })
    }

}

// functin to split text content into chunks
export async function splitTextIntoChunks(documentText) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const chunks = await splitter.splitText(documentText);
    return chunks;
}

// find the matching response values
export const FindMatchingResponse = async (req, res) => {
    try {
        const { question, category, subCategory } = req.body;
        if (!question || typeof question !== "string" || !category || typeof category !== 'string' || !subCategory || typeof subCategory !== "string") {
            return res.status(400).json({ message: "Invalid question type !" })

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
                    visibility: { $eq: "Public" }
                }
            },
            fields: ['text', 'category', 'subCategory', 'date_of_contribution', 'documentId', 'contributor'],
        });

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

                    if (error) throw error;
                    if (!data) {
                        console.warn(`No feedback data found for document ${e.fields.documentId}`);
                        continue;
                    }
                    //3. construct the data of the doc object
                    DocumentsUserForReference.push({
                        doc_id: e.fields.documentId,
                        uploaded_by: e.fields.contributor,
                        upvotes: data.upvotes,
                        downvotes: data.downvotes,
                        partial_upvotes: data.partial_upvotes
                    });

                    seen.add(uniqueKey);
                } catch (formattingdataerror) {
                    console.log(formattingdataerror)
                }
            }

        } catch (er) {
            console.error(er);
        }


        const AnswerToUsersQuestion = await GenerateResponse(question, FoundData);
        // const AnswerToUsersQuestion = 'Kya answer chahiye bhai tujhe?'
        if (AnswerToUsersQuestion.error) {
            return res.status(200).json({ answer: AnswerToUsersQuestion.error })
        }
        // const FormattedResponse = formatAIResponse(AnswerToUsersQuestion)
        // console.log(AnswerToUsersQuestion)

        return res.status(200).json({ message: "Response found", answer: AnswerToUsersQuestion, doc_id: DocumentsUserForReference })


    } catch (error) {
        console.error(error);
    }
}

const StoreContributionDetails = async (name, email, feedback, userid, visibility, documentId) => {
    try {
        if (!name || typeof name !== "string" || !email || typeof email !== "string" || !feedback || typeof feedback !== "string" || !userid) {

            console.log("Either email or name was missing from the parameters");
            return { error: "Invalid data !" }
        }

        const { data, error } = await supabase.from("Contributions").insert({ username: name, email: email, feedback: feedback, user_id: userid, Document_visibility: visibility, document_id: documentId })

        if (error) {
            console.log(error)
            return { error: "Error while recording you contribution details ." }
        }

        return { message: "Done" };

    } catch (error) {
        console.error(error);
        return { error: "Error while storing values in db" }
    }
}


// getting all the documents that are uploaded by the user;

export const GetPrivateUserDocs = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        if (!user_id || typeof user_id !== "string") {
            return res.status(400).json({ message: "Please Login to continue" });
        }

        const { data, error } = await supabase.from("Contributions").select("id, feedback, created_at, document_id").eq("Document_visibility", "Private");

        if (error) {
            console.log(error)
            return res.status(400).json({ message: "Error while looking for documents !" })
        }

        // console.log(data);
        return res.json({ message: "User docs found", data });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error", issue: error })
    }
}

export const QueryPersonalDocs = async (req, res) => {
    try {
        const { docId, question, } = req.body;
        if (!docId || typeof docId !== 'string') {
            return res.status(400).json({ message: "Invalid document Id" });
        }

        const FoundData = [];

        const response = await index.searchRecords({
            query: {
                topK: 10,
                inputs: { text: question },
                filter: {
                    documentId: { $eq: docId },
                    visibility: { $eq: "Private" }
                }
            },
            fields: ['text', 'metadata'],
        });

        // console.log(response.result.hits, 'found results')
        response.result.hits.forEach((e) => {
            if (e) {
                FoundData.push(e.fields.text);
            } else {
                console.log("no results found")
            }
        })


        const AnswerToUsersQuestion = await GenerateResponse(question, FoundData);

        if (AnswerToUsersQuestion.error) {
            return res.status(200).json({ message: "Error while generating a response", answer: "WE currently do not have information regarding this topic" })
        }

        return res.status(200).json({ message: "Response found", answer: AnswerToUsersQuestion })
    } catch (error) {
        return res.status(500).json({ message: error })
    }
}