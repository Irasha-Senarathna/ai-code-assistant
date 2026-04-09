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

RULES:
- Use clear headings
- Use bullet points
- Add spacing between sections
- Be concise and structured
- If giving code, format it properly

User request:
${input}
`;

        const aiResponse = await callGemini(finalPrompt);

        res.json({
            message: "AI response generated successfully",
            response: aiResponse
        });

    } catch (error) {
        console.error("FULL ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { generateResponse };