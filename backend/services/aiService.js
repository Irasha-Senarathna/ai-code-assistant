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

        console.log("RAW GEMINI RESPONSE:", JSON.stringify(response.data, null, 2));

        const text =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("No response text from Gemini");
        }

        return text;

    } catch (error) {
        console.error("FULL ERROR:", error.response?.data || error.message);
        throw new Error("Gemini API failed");
    }
}

module.exports = { callGemini };