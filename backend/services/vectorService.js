const natural = require("natural");

const TfIdf = natural.TfIdf;

let documents = [];
let tfidf = new TfIdf();

// 👉 Add documents (chunks)
function addDocuments(chunks) {
  documents = chunks;
  tfidf = new TfIdf();

  chunks.forEach((chunk) => {
    tfidf.addDocument(chunk);
  });
}

// 👉 Search similar chunks
function search(query, topN = 3) {
  const scores = [];

  tfidf.tfidfs(query, (i, measure) => {
    scores.push({
      text: documents[i],
      score: measure,
    });
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((item) => item.text);
}

module.exports = { addDocuments, search };