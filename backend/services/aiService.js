require("dotenv").config(); // make sure you install dotenv if you haven't! (npm install dotenv)
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Make sure you have GEMINI_API_KEY in your root .env file
const API_KEY = process.env.GEMINI_API_KEY; 

const genAI = new GoogleGenerativeAI(API_KEY);

async function callGemini(prompt, retries = 3, delayMs = 2000) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in your environment variables.");
  }

  // Attempt to call Gemini (Standard version)
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`REAL GEMINI CALL INITIATED... (Attempt ${attempt}/${retries})`);
      
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();

    } catch (error) {
      console.error(`Gemini API attempt ${attempt} failed:`);
      console.error(error); // Log the full error object for debugging
      
      // If we've run out of retries, throw the error so the controller triggers the Fallback UI
      if (attempt === retries) {
        throw new Error(`Gemini failed after ${retries} attempts. ${error.message}`);
      }
      
      // Wait before retrying (Rate limit protection)
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

// ---------- REAL STREAMING VERSION ----------
async function callGeminiStream(prompt) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  
  console.log("REAL GEMINI STREAM CALL INITIATED...");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  try {
    // Generate streamed content
    const result = await model.generateContentStream(prompt);
    
    // We return the raw result stream directly just like you mocked it
    return result.stream; 
    
  } catch (error) {
    console.error("Gemini stream failed", error);
    throw error;
  }
}

module.exports = {
  callGemini,
  callGeminiStream,
};