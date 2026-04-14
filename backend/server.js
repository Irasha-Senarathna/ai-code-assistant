const express = require("express");
const cors = require("cors");
require("dotenv").config();

// PDF & Embedding logic
const { extractTextFromPDF } = require("./services/pdfService");
const { chunkText } = require("./services/chunkService");
const { getEmbedding } = require("./services/embeddingService");
const { storeEmbedding, loadDB } = require("./services/vectorDB");

const connectDB = require("./config/db");

connectDB();

const authRoute = require("./routes/authRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);

// Routes
const generateRoute = require("./routes/generateRoute");
const uploadRoute = require("./routes/uploadRoute");

// Load existing Vector DB from disk
loadDB();

async function loadPDF() {
  try {
    const text = await extractTextFromPDF("./data/sample.pdf");
    const chunks = chunkText(text);

    console.log("Chunks created:", chunks.length);

    for (let chunk of chunks) {
      if (!chunk.trim()) continue;
      const embedding = await getEmbedding(chunk);
      storeEmbedding(chunk, embedding);
    }

    console.log("✅ PDF processed into vector DB");
  } catch (error) {
    console.warn("⚠️ PDF skipping load (sample.pdf might not exist yet):", error.message);
  }
}

// Load RAG Pipeline on startup (Optional: remove if you only want manual uploads)
// loadPDF(); 

app.get("/", (req, res) => {
  res.send("AI Code Assistant is running 🚀");
});

app.use("/generate", generateRoute);
app.use("/upload", uploadRoute);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});