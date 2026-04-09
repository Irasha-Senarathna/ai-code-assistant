import { useState, useEffect, useRef } from "react";
import ChatMessage from "./components/ChatMessage";

export default function App() {
  const [input, setInput] = useState("");
  const [skill, setSkill] = useState("code-review");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
  if (!input.trim() || loading) return;

  const userMsg = {
    role: "user",
    text: input,
    time: new Date().toLocaleTimeString(),
  };

  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setLoading(true);

  try {
    const fakeResponse = `
## AI Assistant Response

Great question! Here is a structured answer:

### 🔹 Explanation
This is a simulated streaming response.

### 🔹 Key Points
- Streaming UI works properly
- Messages update in real-time
- Chat system is stable

### 🔹 Code Example
\`\`\`js
function hello() {
  console.log("Hello World");
}
\`\`\`

### 🔹 Summary
Your system is working perfectly 🎉
`;

    let i = 0;
    let aiText = "";

    // create AI message FIRST and store index
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "",
        time: new Date().toLocaleTimeString(),
      },
    ]);

    const aiIndex = messages.length + 1; // position of AI message

    const interval = setInterval(() => {
      if (i >= fakeResponse.length) {
        clearInterval(interval);
        setLoading(false);
        return;
      }

      aiText += fakeResponse[i];

      setMessages((prev) => {
        const updated = [...prev];

        updated[aiIndex] = {
          ...updated[aiIndex],
          text: aiText,
        };

        return updated;
      });

      i++;
    }, 10);

  } catch (err) {
    console.error(err);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "❌ Error: " + err.message,
        time: new Date().toLocaleTimeString(),
      },
    ]);

    setLoading(false);
  }
};
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900/60 backdrop-blur-md p-4 border-r border-gray-800">
        <h2 className="text-xl font-bold mb-4">⚡ AI Assistant</h2>

        <select
          className="w-full bg-gray-800 p-2 rounded"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        >
          <option value="code-review">Code Review</option>
          <option value="debug">Debug</option>
          <option value="explain">Explain</option>
        </select>

        <div className="mt-6 text-gray-400 text-sm space-y-1">
          <p>✔ Smart AI Engine</p>
          <p>✔ Skill-Based Prompts</p>
          <p>✔ Gemini Powered</p>
          <p>✔ Pro UI Mode</p>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex flex-col flex-1">

        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-900/40 backdrop-blur-md">
          <h1 className="text-lg font-semibold">Chat Assistant</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i}>
              <ChatMessage msg={msg} />
              <div className="text-xs text-gray-500 mt-1 ml-2">
                {msg.time}
              </div>
            </div>
          ))}

          {/* Loading animation */}
          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              Thinking...
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 flex gap-2 bg-gray-900/40 backdrop-blur-md">
          <input
            className="flex-1 p-3 rounded bg-gray-800 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 px-6 rounded hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}