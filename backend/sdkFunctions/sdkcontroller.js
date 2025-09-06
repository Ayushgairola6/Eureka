import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { GenerateResponse } from '../controllers/ModelController.js';
import { supabase } from '../controllers/supabaseHandler.js';
import { getAllDocumentTextsForSummary, index, splitTextIntoChunks, StoreContributionDetails, StoreQueryAndResponse } from '../controllers/fileControllers.js';
import { v4 as uuidv4 } from 'uuid';


// Find the detail of users private documents
export const GetUserDocuments = async (req, res) => {
    try {

        const user_id = req.user;
        if (!user_id) {
            // console.log("User_Id not found")
            return res.status(404).json({ message: "Invalid user please check your API key before proceeding" })
        }
        // get all type of user documents private or public
        const { data, error } = await supabase.from("Contributions").select("*").eq("user_id", user_id);

        if (error) {
            console.log(error, 'error while checking for files ');
            return res.status(404).json({ message: "Error while finding your documents " });
        }

        return res.status(200).json({ documents: data, message: `You have ${data.length} number of documents uploaded` });
    } catch (getdocumenterror) {
        console.error(getdocumenterror);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


// Query an individual document
export const QuerySpecificDocument = async (req, res) => {
    try {
        const user_id = req.user;
        if (!user_id) {
            return res.status(400).send({ message: "Invalid user please check your API key before processing" })
        }
        const { query, document_id, query_type } = req.body;
        if (!query || typeof query !== 'string' || !document_id || typeof document_id !== 'string' || !query_type || typeof query_type !== 'string') {
            console.error("error at step one of checking and validating data types")
            return res.status(400).json({ message: "Invalid arguments" });
        }

        const FoundData = [];
        let response;

        const SYSTEM_PROMPT = query_type === "QNA" ? process.env.SYSTEM_PROMPT : process.env.SUMMARIZER_PROMPT;
        if (query_type === 'QNA') {
            response = await index.searchRecords({
                query: {
                    topK: 30,
                    inputs: { text: query },
                    filter: {
                        documentId: { $eq: document_id },
                        visibility: { $eq: "Private" }
                    }
                },
                fields: ['text'],
            });

            //  console.log(response)
            if (response.result.hits.length === 0) {
                console.error("Response not geenrated at response.result from pinecone")
                return res.status(200).json({ message: "Response found", answer: `Could you please be more specific about what you would like to know about this topic`, doc_id: [] });
            }

        } else if (query_type === "Summary") {

            const { data, error } = await supabase.from("Contributions").select("feedback , chunk_count ,username").eq("document_id", document_id);

            if (error || !data.length === 0) {
                console.error("Document not found in the database")

                return res.status(404).json({ message: "Unable to find this document in our database" });
            }

            //   console.log(data)
            response = await getAllDocumentTextsForSummary(document_id, data[0].username, data[0].feedback, data[0].chunk_count)
            if (!response || response.length === 0) {
                console.error("No summary found")

                return res.status(200).json({ message: "Response found", answer: `There was no data in our database about this document !`, doc_id: [] });
            }
        } else {
            // Handle invalid query_type
                console.error("Invalid query type")

            return res.status(400).json({ message: "Invalid query type" });
        }
        if (response?.result?.hits) {
            response.result.hits.forEach((e) => {
                if (e) {
                    FoundData.push(e.fields.text);
                } else {
                    console.log("no results found")
                }
            })
        } {

        }


        const AnswerToUsersQuestion = await GenerateResponse(query, FoundData.length !== 0 ? FoundData : response, SYSTEM_PROMPT);
        // const AnswerToUsersQuestion = 'random text';
        if (AnswerToUsersQuestion.error) {
            console.log(AnswerToUsersQuestion.error)
            return res.status(200).json({ message: "Error while generating a response", answer: "The server is very busy right now that is why Eureka was unable to responsd , please try again later" })
        }
        const storeResponse = await StoreQueryAndResponse(user_id, query, AnswerToUsersQuestion, document_id);

        if (storeResponse.error) {
            console.log(storeResponse?.error);
            return res.status(200).json({ message: "Could not store this request", answer: AnswerToUsersQuestion })
        }
        return res.status(200).json({ message: "Response found", answer: AnswerToUsersQuestion })
    } catch (error) {
        console.error(error);
    }
}


// Store a particular document
export const StoreDocument = async (req, res) => {
    try {
        const userid = req.user;
        if (!userid || typeof userid !== 'string') {
            return res.status(400).json({ message: "Unauthorized" })
        }
        const { category, name, title, subCategory, visibility } = req.body
        const UserUploadedfile = req.file;
        //   console.log(req.body)
        if (!UserUploadedfile) return res.status(400).json({ message: "Please upload a valid document" });

        if (!category || typeof category !== 'string' || !name || typeof name !== 'string' || typeof name !== 'string' || typeof title !== 'string' || !title || !UserUploadedfile || !subCategory || typeof subCategory !== "string" || !visibility) {
            return res.status(400).json({ message: "Invalid data type !" })
        }

        const { data, error } = await supabase.from("users").select("email").eq("id", userid);
        if (error || data.length == 0) {
            console.log("error while extracting the user data from the database");
            return res.status(404).json({ message: "User not found" })
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
        const documentId = uuidv4();
        let chunkNumber;
        // array to store a unique record array for upsert operation
        const recordsToUpsert = [];
        // the size of one batch that we process
        const batchSize = 100; // Adjust batch size based on your index type and data size

        // loop to start pushing chunks into the db
        for (let i = 0; i < textChunks.length; i++) {
            // Generate a unique ID for each chunk
            // Option 1: documentId-chunkIndex (simple)
            chunkNumber = i;
            const chunkId = `${documentId.trim()}:${name.trim()}:${title.trim()}:${chunkNumber}`;


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
        const StoredContribution = await StoreContributionDetails(name, email, feedback, userid, visibility, documentId, chunkNumber);

        if (StoredContribution?.error) {
            console.log(StoredContribution?.error)
            return res.status(400).json({ message: StoredContribution.error })
        }
        return res.json({ message: "Upload successfull" })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong , please check your file and try again" });
    }
}