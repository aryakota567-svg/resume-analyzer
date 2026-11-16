
import * as pdfjsLib from "pdfjs-dist/webpack.mjs";
import mammoth from "mammoth";

// Extract text from PDF
const extractPDFText = async (file) => {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  let extractedText = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item) => item.str || "")
      .join(" ");

    extractedText += pageText + "\n";
  }

  return extractedText.trim();
};

// Extract text from DOCX
const extractDOCXText = async (file) => {
  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.extractRawText({
    arrayBuffer,
  });

  return result.value.trim();
};

// Main extraction function
export const extractResumeText = async (file) => {
  if (!file) {
    throw new Error("Please upload a resume first.");
  }

  const extension = file.name
    .split(".")
    .pop()
    .toLowerCase();

  if (extension === "pdf") {
    return await extractPDFText(file);
  }

  if (extension === "docx") {
    return await extractDOCXText(file);
  }

  throw new Error("Unsupported file format. Upload PDF or DOCX.");
};
