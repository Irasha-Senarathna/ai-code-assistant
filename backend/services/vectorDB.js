const fs = require("fs");
const path = require("path");

let db = []; // In-memory vector database

// Save database to file
function saveDB() {
  try {
    const dataPath = path.join(__dirname, "../data/vectorDB.json");
    // Ensure data directory exists
    if (!fs.existsSync(path.dirname(dataPath))) {
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(db));
  } catch (error) {
    console.error("Failed to save Vector DB:", error);
  }
}

// Load database from file
function loadDB() {
  const dataPath = path.join(__dirname, "../data/vectorDB.json");
  if (fs.existsSync(dataPath)) {
    try {
      db = JSON.parse(fs.readFileSync(dataPath));
      console.log(`✅ Loaded ${db.length} embeddings from disk.`);
    } catch (error) {
      console.error("Failed to load Vector DB:", error);
    }
  }
}

// Save embeddings with a source
function storeEmbedding(text, embedding, source = "default") {
  db.push({ text, embedding, source });
  saveDB(); // Optionally save automatically on store
}

// Cosine similarity
function cosineSimilarity(a, b) {
  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  // Avoid division by zero
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Search similar
function searchEmbedding(queryEmbedding, topN = 3) {
  const results = db.map((item) => ({
    text: item.text,
    score: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  // Sort descending by score, take top N
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((r) => r.text);
}

module.exports = { storeEmbedding, searchEmbedding, saveDB, loadDB };
