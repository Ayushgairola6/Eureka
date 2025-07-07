import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone'
dotenv.config();
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const pc = new Pinecone({
    apiKey: process.env.PINECONE_DB_API_KEY
});
const Mode_prompt = process.env.SYSTEM_PROMPT;

export const GenerateResponse = async (question, data) => {
    try {
        if (!question || !data) {
            console.error("Not all the data was given to the model")
        }

        const FormattedData = [{
            role: "user", parts: [{ text: question }]
        }, {
            role: "model", parts: [{ text: JSON.stringify({ ...data },Mode_prompt) }]
        }
        ]
        const result = await genAI.models.generateContent({
            model:"gemini-1.5-flash",
            contents: FormattedData,
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 600,
            }
        });

        const responseText = result.text;
        // console.log(responseText)
        if (!responseText) {
            return { error: "I am having some issues right now, can we talk later, I am really sorry for this issue, thanks for understanding me " }
        }
    
        return responseText;
    } catch (error) {
        console.error(`error while generating a response ${error}`);
        return { error: "Error while generating a response by the model" };
    }
}



export const GenerateEmbeddings = async (file_content) => {
    try {
        if (!file_content || typeof file_content !== "string") {
            return { error: "Invalid content type" };
        }

        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: file_content,
            config: {
                taskType: "SEMANTIC_SIMILARITY",
            }
        });

        // console.log(response.embeddings);
        if (!response.embeddings) {
            return { error: "Error while generating embeddings for chunks" };
        }

        return response.embeddings

    } catch (error) {
        console.error(error);
        return { error: "Error while Generated embeddings", error };
    }
}





const createIndex = async () => {
    try {
        const documentId = uuidv4();
        await pc.createIndexForModel({
            name: "knowledge-base-index",
            cloud: "aws",
            region: "us-east-1",
            embed: {
                model: "llama-text-embed-v2",
                fieldMap: { text: "text" }
            },

        });

        await pc.index("knowledge_base_index").configureIndex({
            indexed: [
                "category",
                "doc_id",
                "chunk_index",
                "email",
                "name",
                "upload_date"
            ]
        })
    } catch (error) {
        console.error(error)
    }
}
// createIndex()