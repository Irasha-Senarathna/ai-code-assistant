const { GoogleGenerativeAI } = require("@google/generative-ai");

// Make sure you have GEMINI_API_KEY in your root .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Convert text → vector
async function getEmbedding(text) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004", // Updated to a newer recommended embedding model
  });

  const result = await model.embedContent(text);

  return result.embedding.values;
}

module.exports = { getEmbedding };
