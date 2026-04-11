let db = []; // In-memory vector database

// Save embeddings
function storeEmbedding(text, embedding) {
  db.push({ text, embedding });
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

module.exports = { storeEmbedding, searchEmbedding };
