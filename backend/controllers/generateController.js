const { callGemini } = require("../services/aiService");
const { getEmbedding } = require("../services/embeddingService");
const { searchEmbedding } = require("../services/vectorDB");

const generateResponse = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input required" });
    }

    // 🔍 Convert query to embedding
    const queryEmbedding = await getEmbedding(input);

    // 🔍 Search similar chunks
    const relevantChunks = searchEmbedding(queryEmbedding);

    // 🧠 Build context
    const context = relevantChunks.join("\n\n");

    // Construct a grounded prompt
    const finalPrompt = [
      "You are a professional AI assistant.",
      "Answer ONLY using the knowledge context provided below.",
      "If the answer is not found in the context, reply exactly: 'Not found in knowledge base.'",
      "",
      "Knowledge Context:",
      context || "No relevant context found.",
      "",
      "User Request:",
      input
    ].join("\n");

    let aiResponse;

    try {
      aiResponse = await callGemini(finalPrompt);
    } catch (error) {
      console.error("⚠️ Gemini failed, using fallback:", error.message);

      // Fixed: Removed undefined kbContext reference
      aiResponse = [
        "## ⚠️ Fallback Mode Activated",
        "",
        "The AI service is currently unavailable.",
        "",
        "### 🔹 Your Input",
        input,
        "",
        "### 🔹 Relevant Context Found:",
        context || "No relevant context found in the knowledge base."
      ].join("\n");
    }

    // Streaming the response to the client
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const words = aiResponse.split(" ");
    for (let i = 0; i < words.length; i++) {
        res.write(words[i] + " ");
        await new Promise(r => setTimeout(r, 20)); 
    }
    
    res.end(); 

  } catch (error) {
    console.error("Error in generateResponse:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generateResponse };