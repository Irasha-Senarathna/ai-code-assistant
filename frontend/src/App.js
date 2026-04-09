import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function App() {
  const [input, setInput] = useState("");
  const [skill, setSkill] = useState("code-review");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/generate", {
        skill,
        input,
      });

      const aiMsg = { role: "ai", text: res.data.response };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "❌ Error connecting to server" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-4 border-r border-gray-800">
        <h2 className="text-xl font-bold mb-4">AI Assistant</h2>

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
          <p>✔ Smart AI</p>
          <p>✔ Skill-based prompts</p>
          <p>✔ Gemini powered</p>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex flex-col flex-1">

        {/* Header */}
        <div className="p-4 border-b border-gray-800 text-lg font-semibold">
          Chat Assistant
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-xl p-3 rounded-lg whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 ml-auto"
                  : "bg-gray-800"
              }`}
            >
              {msg.role === "ai" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex gap-2 items-center text-gray-400">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              Thinking...
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 flex gap-2">
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