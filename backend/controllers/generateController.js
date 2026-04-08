const { getSkillPrompt } = require("../services/skillService");
const { callGemini } = require("../services/aiService");

const generateResponse = async (req, res) => {
    try {
        const { skill, input } = req.body;

        if (!skill || !input) {
            return res.status(400).json({ error: "Skill and input required" });
        }

        const skillText = getSkillPrompt(skill);

        const finalPrompt = `${skillText}\n\nUser Input:\n${input}`;

        // 🔥 CALL REAL AI
        const aiResponse = await callGemini(finalPrompt);

        res.json({
            message: "AI response generated successfully",
            response: aiResponse
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { generateResponse };