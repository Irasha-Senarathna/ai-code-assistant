const { getSkillPrompt } = require("../services/skillService");

const generateResponse = (req, res) => {
    try {
        const { skill, input } = req.body;

        if (!skill || !input) {
            return res.status(400).json({ error: "Skill and input required" });
        }

        const skillText = getSkillPrompt(skill);

        const finalPrompt = `${skillText}\n\nUser Input:\n${input}`;

        res.json({
            message: "Prompt generated successfully",
            prompt: finalPrompt
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { generateResponse };