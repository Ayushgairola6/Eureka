import mammoth from "mammoth";
import { parse } from "csv-parse/sync";
import officeparser from "officeparser";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

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
