const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const FAKE_RESPONSE = `
## AI Assistant Response

Great question! Here is a structured answer:

### 🔹 Explanation
This is a simulated response because the Gemini API quota was exceeded temporarily. It behaves like real AI output.

### 🔹 Key Points
- Streaming UI works properly
- Messages update in real-time
- Chat system is ready for backend integration

### 🔹 Code Example
\`\`\`js
function hello() {
  console.log("Hello World");
}
\`\`\`

### 🔹 Summary
Your frontend streaming system is working perfectly 🎉
`;

// ---------- MOCK NORMAL VERSION ----------
async function callGemini(prompt, retries = 3, delayMs = 2000) {
  console.log("MOCK CALL GEMINI ACTIVATED");
  await sleep(1000); // simulate network delay
  return FAKE_RESPONSE;
}

// ---------- MOCK STREAMING VERSION ----------
async function callGeminiStream(prompt) {
  console.log("MOCK CALL GEMINI STREAM ACTIVATED");
  
  // Return an async generator that yields chunks of the fake response
  async function* mockStreamGenerator() {
    const words = FAKE_RESPONSE.split(/\s+/);
    
    // add spaces back intentionally for realistic word-by-word streaming
    for (let i = 0; i < words.length; i++) {
      yield {
        text: () => words[i] + " "
      };
      await sleep(30); // small delay to simulate real streaming chunks
    }
  }

  return mockStreamGenerator();
}

module.exports = {
  callGemini,
  callGeminiStream,
};