import mammoth from "mammoth";
import { parse } from "csv-parse/sync";
import officeparser from "officeparser";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { MarkdownTextSplitter } from "@langchain/textsplitters";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { PDFExtract } from "pdf.js-extract";
import { toMarkdown } from "mdast-util-to-markdown";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import { supabase } from "../controllers/supabaseHandler.js";
import pdf2md from "@opendocsg/pdf2md";

const AllowedFileTypes = ["docx", "json", "md", "pptx", "csv", "txt", "pdf"];

const pdfExtract = new PDFExtract();

export const CheckFileTypeAndParseIt = async (file) => {
  try {
    const FileType = file.originalname.split(".").pop().toLowerCase();
    if (!FileType) {
      return { error: "Unable to idenitfy the type of file" };
    }

    const isValid = AllowedFileTypes.includes(FileType);

    if (!isValid) {
      return { error: "This file type is not supported at the moment " };
    }

    // now conditional parsing of files based on their type
    let text;
    if (FileType === "docx") {
      text = await ParseDocxFileType(file);
    } else if (FileType === "pdf") {
      text = await ParsePdfFileType(file);
    } else if (FileType === "json") {
      text = await ParseJSONFileType(file);
    } else if (FileType === "txt") {
      text = await ParseTxtileType(file);
    } else if (FileType === "csv") {
      text = await ParseCsvFileType(file);
    } else if (FileType === "md") {
      text = await ParseMdFileType(file);
    } else if (FileType === "pptx") {
      text = await ParsePptxFileType(file);
    }

    return text;
  } catch (error) {
    console.error(
      `Error while identifying the type of uploaded file : ${error}`
    );
    return error;
  }
};

async function ParseDocxFileType(file) {
  const buffer = file.buffer;
  const resultText = await mammoth.extractRawText(file);
  return resultText.value;
}

async function ParseJSONFileType(file) {
  return file.buffer.toString("utf-8");
}

async function ParseTxtileType(file) {
  return file.buffer.toString("utf-8");
}

async function ParseCsvFileType(file) {
  const content = file.buffer.toString("utf-8");
  const rows = parse(content, { columns: true, skip_empty_lines: true });

  return rows
    .map((row) => {
      return (
        "Row Data: " +
        Object.entries(row)
          .map(([key, val]) => `${key}=${val}`)
          .join(", ")
      );
    })
    .join("\n");
}

async function ParseMdFileType(file) {
  return file.buffer.toString("utf-8");
}

async function ParsePptxFileType(file) {
  try {
    const text = await officeparser.parseOfficeAsync(file.buffer);
    return text;
  } catch (error) {
    throw new Error("Failed to parse PPTX: " + error.message);
  }
}

async function ParsePdfFileType(file) {
  // const blob = new Blob([file.buffer], { type: file.mimetype });
  // const loader = new PDFLoader(blob, {
  //   splitPages: false,
  // });

  // const docs = await loader.load();

  // if (!docs || docs.length === 0 || !docs[0].pageContent) {
  //   return res.status(400).json({ message: "Error while uploading the file" });
  // }
  // return docs[0].pageContent;
  const buffer = file.buffer;

  // pdf2md expects a typed array or buffer
  const markdown = await pdf2md(buffer);

  return markdown;
}

// handling markdowns
const splitter = new MarkdownTextSplitter({
  chunkSize: 1000, // Maximum size of each chunk
  chunkOverlap: 200, // Overlap between consecutive chunks
});

export async function splitMarkdown(markdownContent) {
  const documents = await splitter.createDocuments([markdownContent]);
  return documents;
}

// Function to split markdown by headings
export function chunkMarkdown(mdText, maxChunkSize = 1000) {
  const chunks = [];
  let currentChunk = "";
  let insideCodeBlock = false;

  const lines = mdText.split("\n");

  for (let line of lines) {
    // detect code block start/end
    if (line.trim().startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
    }

    // check if adding this line exceeds max size
    if (
      currentChunk.length + line.length + 1 > maxChunkSize &&
      !insideCodeBlock
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }

    currentChunk += line + "\n";
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
export function formatSSEChunk(chunk) {
  // split by newline and prefix each line with "data: "
  return (
    chunk
      .split(/\r?\n/)
      .map((line) => `data: ${line}`)
      .join("\n") + "\n\n"
  ); // terminate event with double newline
}

// creating a batch to process the chunks of context from public docs
export const HandleSourceCreation = async (
  response,
  plan_type,
  MessageId
) => {
  const Reference = {
    MessageId,
    docs: [],
  };
  const IdsToFetch = [];
  const batchSize = plan_type === 'free' ? 10 : 20; //this determine how many documents to process at once

  const seen = new Set(); // a set to track the uniqueness of document

  if (!response || !response.result || !Array.isArray(response.result.hits)) {
    await notifyMe("Invalid response passed to HandleSourceCreation");
    return { error: "Invalid response" };
  }

  // iterate through hits and flush batches when full or at the last hit
  for (let i = 0; i < response.result.hits.length; i++) {
    let currentChunk = response.result.hits[i];
    // only process the chunk if it has not already been seen and has a documentId
    const docId = currentChunk?.fields?.documentId;
    if (!docId) continue;

    if (!seen.has(docId)) {
      IdsToFetch.push(docId); // add it to the array
      seen.add(docId); // include the id in the set

      if (
        IdsToFetch.length === batchSize ||
        i === response.result.hits.length - 1
      ) {
        await HandleChunkProcssing(IdsToFetch, Reference); // fetch data of these ids and process them
        IdsToFetch.length = 0; // clear the batch after processing
      }
    }
  }

  // handling leftover chunks (safety net)
  if (IdsToFetch.length > 0) {
    try {
      await HandleChunkProcssing(IdsToFetch, Reference);
    } catch (error) {
      await notifyMe(` error while chunks refrecne procssing`, error);
      return { error: "Error during Pinecone upsert operation." };
    }
  }

  return Reference;
};

//helper function to process the chunks
const HandleChunkProcssing = async (chunksToProces, Reference) => {
  if (!Array.isArray(chunksToProces) || chunksToProces.length === 0) return;
  if (!Reference) Reference = { docs: [] };

  const { data, error } = await supabase.rpc("get_likes_counts", {
    doc_ids: chunksToProces,
  });
  // chunksToProces = array of
  if (error) {
    await notifyMe(
      "An error occured while searching for feedback report of a document in the db",
      error
    );
    return;
  }
  // added them to the array
  if (data && data?.length > 0) {
    data.forEach((e) => {
      Reference.docs.push({
        doc_id: e.document_id,
        upvotes: e.upvotes,
        downvotes: e.downvotes,
        partial_upvotes: e.partial_upvotes,
      });
    });
  } else {
    chunksToProces.forEach((i) => {
      Reference.docs.push({
        doc_id: i,
        upvotes: 0,
        downvotes: 0,
        partial_upvotes: 0,
      });
    });
  }
};

// creating a context string for the model to understand
export const processContextStringCreation = async (response) => {
  let result = "";

  // looping and appending to original string
  response.result.hits.forEach((e) => {
    result += `Score=${e._score}&&Content=${e.fields.text}`;
  });

  if (!result || result === "") {
    await notifyMe("An error occured while creating the context string");
    return {
      message:
        "I do not have necessary information regarding your query right now.",
    };
  }
  return result;
};
