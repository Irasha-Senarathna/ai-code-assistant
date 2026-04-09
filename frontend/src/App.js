import { useState } from "react";
import axios from "axios";

export default function App() {
  const [input, setInput] = useState("");
  const [skill, setSkill] = useState("code-review");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

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
        { role: "ai", text: "Error connecting to server" },
      ]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      
      {/* Header */}
      <div className="p-4 text-center text-2xl font-bold border-b border-gray-700">
        AI Code Assistant
      </div>

      {/* Skill Selector */}
      <div className="p-4 flex justify-center gap-4">
        <select
          className="bg-gray-800 p-2 rounded"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        >
          <option value="code-review">Code Review</option>
          <option value="debug">Debug</option>
          <option value="explain">Explain</option>
        </select>
      </div>

      {/* Chat Box */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-xl ${
              msg.role === "user"
                ? "bg-blue-600 ml-auto"
                : "bg-gray-700"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="text-gray-400">AI is thinking...</div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 flex gap-2 border-t border-gray-700">
        <input
          className="flex-1 p-2 rounded bg-gray-800 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your code here..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}