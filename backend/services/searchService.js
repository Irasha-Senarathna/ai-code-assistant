const knowledgeBase = require("../data/knowledgeBase");

function searchKnowledge(query) {
  // 1. Clean query and split into individual words
  const searchWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2); // ignore "is", "a", etc.

  // 2. Map items and count how many words match
  const scoredResults = knowledgeBase.map(item => {
    const textLower = item.text.toLowerCase();
    
    // Count matches
    const matchCount = searchWords.reduce((count, word) => {
      return textLower.includes(word) ? count + 1 : count;
    }, 0);

    return { ...item, score: matchCount };
  });

  // 3. Filter out things with 0 matches, sort by highest score, return top 3
  const results = scoredResults
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Top 3 results

  return results;
}

module.exports = { searchKnowledge };