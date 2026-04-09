const { getSkillPrompt } = require("../services/skillService");
const { callGeminiStream } = require("../services/aiService");

const generateResponse = async (req, res) => {
  try {
    const { skill, input } = req.body;

    console.log("Incoming request:", req.body);

    if (!skill || !input) {
      return res.status(400).json({ error: "Skill and input required" });
    }

    const skillText = getSkillPrompt(skill);

    const finalPrompt = `
You are a professional AI assistant.

Skill Context:
${skillText}

RULES:
- Use clear headings
- Use bullet points
- Add spacing between sections
- Be concise and structured
- If giving code, format it properly

User request:
${input}
`;

    // ✅ STREAMING HEADERS
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    // 🔥 CALL STREAM FUNCTION
    const stream = await callGeminiStream(finalPrompt);

    // 🔥 SEND DATA CHUNK BY CHUNK
    for await (const chunk of stream) {
      const text = chunk.text();

      if (text) {
        res.write(text);
      }
    }

    // ✅ END RESPONSE
    res.end();

  } catch (error) {
    console.error("FULL ERROR:", error);

    // ⚠️ Important: can't send JSON after streaming started
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.end();
    }
  }
};

module.exports = { generateResponse };