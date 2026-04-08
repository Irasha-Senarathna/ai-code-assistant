const axios = require("axios");

async function callGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;

    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await axios.post(url, {
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ]
        });

        return response.data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.log("FULL ERROR:", error.response?.data || error.message);
        throw new Error("Gemini API failed");
    }
}

module.exports = { callGemini };