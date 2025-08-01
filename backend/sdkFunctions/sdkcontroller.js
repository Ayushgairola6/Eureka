import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { GenerateResponse } from '../controllers/ModelController.js';
import { supabase } from '../controllers/supabaseHandler.js';
import { splitTextIntoChunks } from '../controllers/fileControllers.js';
import { v4 as uuidv4 } from 'uuid';


const GetUserDocuments = async (req, res) => {
    try {

        const { data, error } = await supabase.from('API_KEYS').select(`user_id ,Contributions(id,document_id,created_at)`);

        if (error) {
            return res.status(400).json({ message: "Error while finding your documents" });
        }
        return res.status(200).json(data);
    } catch (getdocumenterror) {
        console.error(getdocumenterror);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const QuerySpecificDocument = async (req, res) => {
    try {
        const { query, docId } = req.body;
        if (!query || typeof query !== 'string' || docId || typeof docId !== 'string') {
            return res.status(400).json({ message: "Invalid arguments" });
        }
        const FoundData = [];

        // find the matching information from the vector db
        const response = await index.searchRecords({
            query: {
                topK: 10,
                inputs: { text: query },
                filter: {
                    documentId: { $eq: docId },
                    visibility: { $eq: "Private" }
                }
            },
            fields: ['text', 'category', 'subCategory', 'date_of_contribution', 'documentId', 'contributor', 'id'],
        });

        // as it returns a nested object , extract only the text values from the 
        response.result.hits.forEach((e) => {
            if (e) {
                FoundData.push(e.fields.text);
            } else {
                console.log("no results found")
            }
        })


        const AnswerToUsersQuestion = await GenerateResponse(query, FoundData);

        if (AnswerToUsersQuestion.error) {
            return res.status(200).json({ message: "Error while generating a response", answer: "WE currently do not have information regarding this topic" })
        }

        return res.status(200).json({ message: "Response found", answer: AnswerToUsersQuestion })
    } catch (error) {
        console.error(error);
    }
}

const StoreDocument = async (req, res) => {
    try {
        const { category, name, title, subCategory, visibility } = req.body
        const UserUploadedfile = req?.file;
        if (!UserUploadedfile) return res.status(400).json({ message: "Please upload a valid document" });

        if (!category || typeof category !== 'string' || !name || typeof name !== 'string' || typeof name !== 'string' || typeof title !== 'string' || !title || !email || !file || !subCategory || typeof subCategory !== "string" || !visibility) {
            return res.status(400).json({ message: "Invalid data type !" })
        }

        const documentId = uuidv4();

        const StoredContribution = await StoreContributionDetails(name, email, title, userid, visibility, documentId);

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

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while storing your document" });
    }
}