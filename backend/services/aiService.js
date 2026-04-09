const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ---------- NORMAL (YOUR CURRENT WORKING VERSION) ----------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini(prompt, retries = 3, delayMs = 2000) {
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(url, {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      });

      console.log(
        `RAW GEMINI RESPONSE (Attempt ${attempt}):`,
        JSON.stringify(response.data, null, 2)
      );

      const text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("No response text from Gemini");
      }

      return text;

    } catch (error) {
      console.error(
        `GEMINI API ERROR (Attempt ${attempt}):`,
        error.response?.data?.error?.message || error.message
      );

      lastError = error;

      const statusCode = error.response?.status;

      if (statusCode === 503 || statusCode === 429) {
        if (attempt < retries) {
          console.log(`Retrying in ${delayMs}ms...`);
          await sleep(delayMs);
          continue;
        }
      } else {
        break;
      }
    }
  }

  const errorMessage =
    lastError?.response?.data?.error?.message ||
    lastError.message ||
    "Unknown error";

  throw new Error(`Gemini API failed: ${errorMessage}`);
}

// ---------- 🔥 STREAMING VERSION (NEW) ----------
// Move initialization INSIDE the function so `process.env` is definitely loaded
async function callGeminiStream(prompt) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Switch to explicitly use the same model as your Axios call
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContentStream(prompt);

    return result.stream;

  } catch (error) {
    console.error("STREAM ERROR:", error.message);
    // Passing the actual error message will help you debug if it fails again
    throw new Error(`Gemini Streaming failed: ${error.message}`);
  }
}

module.exports = {
  callGemini,
  callGeminiStream,
};