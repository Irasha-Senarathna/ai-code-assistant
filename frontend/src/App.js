import { useState, useEffect, useRef } from "react";
import ChatMessage from "./components/ChatMessage";

export default function App() {
  const [input, setInput] = useState("");
  const [skill, setSkill] = useState("code-review");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const bottomRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load saved chats
  useEffect(() => {
    const saved = localStorage.getItem("chatMessages");
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  // Persist chats
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, input }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Server error");
      }

      if (!res.body) {
        throw new Error("Streaming not supported by browser");
      }

      // create placeholder AI message
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "", time: new Date().toLocaleTimeString() },
      ]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const cleanChunk = chunk.replace(/^data: /gm, "");
        aiText += cleanChunk;

        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: aiText,
            };
          }
          return updated;
        });
      }

      setLoading(false);

    } catch (err) {
      console.error("Frontend error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "❌ " + (err.message || err), time: new Date().toLocaleTimeString() },
      ]);
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex h-screen ${
        darkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`w-64 ${darkMode ? "bg-gray-900/60" : "bg-white/80"} backdrop-blur-md p-4 border-r border-gray-800`}
      >
        <h2 className="text-xl font-bold mb-4">⚡ AI Assistant</h2>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full mb-3 bg-gray-700 p-2 rounded hover:bg-gray-600 transition"
        >
          Toggle Theme
        </button>

        <select
          className={`w-full p-2 rounded ${darkMode ? "bg-gray-800" : "bg-white border"}`}
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        >
          <option value="code-review">Code Review</option>
          <option value="debug">Debug</option>
          <option value="explain">Explain</option>
        </select>

        <button
          onClick={() => { setMessages([]); localStorage.removeItem("chatMessages"); }}
          className="w-full mt-4 bg-red-600 p-2 rounded hover:bg-red-700 transition"
        >
          Clear Chat
        </button>

        <div className="mt-6 text-sm text-gray-400 space-y-2 max-h-40 overflow-y-auto">
          <p className="text-white font-semibold">Recent Chats</p>

          {messages.slice(-5).map((msg, i) => (
            <div key={i} className={`truncate p-2 rounded text-xs ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              {msg.text ? msg.text.slice(0, 40) : ""}
            </div>
          ))}
        </div>

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
        <div
          className={`p-4 border-b border-gray-800 ${darkMode ? "bg-gray-900/40" : "bg-white/30"} backdrop-blur-md`}
        >
          <h1 className="text-lg font-semibold">Chat Assistant</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className="group">
              <div className="flex items-start gap-2">
                <ChatMessage msg={msg} />

                {msg.role === "user" && (
                  <button
                    onClick={() => {
                      const newText = prompt("Edit your message:", msg.text);
                      if (newText === null) return;
                      setMessages((prev) => {
                        const updated = [...prev];
                        updated[i] = { ...updated[i], text: newText };
                        return updated;
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 ml-2"
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>

              <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-600"} mt-1 ml-2`}>
                {msg.time}
              </div>
            </div>
          ))}

          {/* Loading animation */}
          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              </div>
              <span>AI is typing...</span>
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        <div
          className={`p-4 border-t border-gray-800 flex gap-2 ${darkMode ? "bg-gray-900/40" : "bg-white/30"} backdrop-blur-md`}
        >
          <input
            className={`flex-1 p-3 rounded outline-none ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
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