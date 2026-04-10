const { getSkillPrompt } = require("../services/skillService");
const { callGemini } = require("../services/aiService");

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
- Add spacing
- Be clear and structured

User request:
${input}
`;

    let aiResponse;

    try {
      // ✅ TRY REAL GEMINI
      aiResponse = await callGemini(finalPrompt);

    } catch (error) {
      console.error("⚠️ Gemini failed, using fallback");

      // ✅ FALLBACK RESPONSE
      aiResponse = `
## ⚠️ Fallback Mode Activated

Gemini API is currently unavailable (quota or error).

### 🔹 Your Input
${input}

### 🔹 Simulated Answer
- This is a mock AI response
- Your UI is still working perfectly
- System automatically handled failure

### 🔹 Example Code
\`\`\`js
console.log("Fallback working");
\`\`\`

### ✅ Status
Your system is stable and production-ready 🚀
`;
    }

    res.json({
      response: aiResponse,
    });

  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generateResponse };