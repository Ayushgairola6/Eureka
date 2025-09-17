import mammoth from "mammoth";
import { parse } from "csv-parse/sync";
import officeparser from "officeparser";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { MarkdownTextSplitter } from "@langchain/textsplitters";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { toMarkdown } from "mdast-util-to-markdown";
const AllowedFileTypes = ["docx", "json", "md", "pptx", "csv", "txt", "pdf"];

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
  return parse(content, { columns: true, skip_empty_lines: true });
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
  const blob = new Blob([file.buffer], { type: file.mimetype });
  const loader = new PDFLoader(blob, {
    splitPages: false,
  });
  const docs = await loader.load();
  // console.log(docs[0].pageContent[0]);

  if (!docs || !docs[0].pageContent) {
    return res.status(400).json({ message: "Error while uploading the file" });
  }
  return docs[0].pageContent;
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
// Example markdown content
const markdownContent = `
# Main Heading
This is some introductory text.

## Subheading 1
This is the content for subheading 1.
It can include multiple paragraphs.

\`\`\`javascript
console.log('This is a code block');
\`\`\`

## Subheading 2
This is the content for subheading 2.
- It has a list item
- And another one
`;
