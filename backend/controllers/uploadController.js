const { extractTextFromPDF } = require("../services/pdfService");
const { chunkText } = require("../services/chunkService");
const { getEmbedding } = require("../services/embeddingService");
const { storeEmbedding, saveDB } = require("../services/vectorDB");

const processPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const documentName = req.file.originalname;

    const text = await extractTextFromPDF(filePath);
    const chunks = chunkText(text);

    for (let chunk of chunks) {
      if (!chunk.trim()) continue;
      const embedding = await getEmbedding(chunk);
      storeEmbedding(chunk, embedding, documentName);
    }
    
    // Save DB to disk
    saveDB();

    res.json({
      message: "✅ PDF uploaded and processed successfully",
      chunks: chunks.length,
      documentName,
    });

  } catch (err) {
    console.error("PDF Upload Error:", err);
    res.status(500).json({ error: "PDF processing failed" });
  }
};

module.exports = { processPDF };