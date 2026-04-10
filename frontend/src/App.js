import { useState, useEffect, useRef } from "react";
import ChatMessage from "./components/ChatMessage";

export default function App() {
  const [input, setInput] = useState("");
  const [skill, setSkill] = useState("code-review");
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chatList");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem("chatList");
    const parsedChats = saved ? JSON.parse(saved) : [];
    return parsedChats.length > 0 ? parsedChats[0].id : null;
  });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [documents, setDocuments] = useState({}); // Stores uploaded text per chat ID
  const [useAI, setUseAI] = useState(false); // Controls whether to call Gemini
  const [apiCount, setApiCount] = useState(() => {
    return Number(localStorage.getItem("apiCount")) || 0;
  });

  const bottomRef = useRef(null);

  // Helper to get current messages
  const messages = chats.find((c) => c.id === currentChatId)?.messages || [];

  // Helper setter to maintain compatibility with existing message update logic
  const setMessages = (updater) => {
    if (!currentChatId) return;
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === currentChatId) {
          const nextMessages = typeof updater === "function" ? updater(chat.messages) : updater;
          const newTitle = chat.title === "New Chat" && nextMessages.length > 0
            ? nextMessages[0].text.slice(0, 25) + "..."
            : chat.title;
          return { ...chat, messages: nextMessages, title: newTitle };
        }
        return chat;
      })
    );
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Persist chats
  useEffect(() => {
    localStorage.setItem("chatList", JSON.stringify(chats));
  }, [chats]);

  const sendMessage = async () => {
    if (!input.trim() || !currentChatId) return;

    // 1. Grab any document stored for this chat
    const chatDocument = documents[currentChatId] || null;

    const userMsg = {
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString(),
    };

    updateChatMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);

    // ============================================
    // 🟢 LOCAL MOCK / RAG MODE (SAVES API QUOTA!)
    // ============================================
    if (!useAI) {
      setTimeout(() => {
        let fakeText = "";

        if (chatDocument) {
          // Fake Local RAG Logic
          fakeText = `📄 **Local RAG Memory**\n\nI see you uploaded a document. I am analyzing the content locally. You asked: "${userMsg.text}".\n\n*(Turn on AI Mode ⚡ to ask Gemini about this document)*`;
        } else {
          // Fake Basic Response
          fakeText = `🤖 **Local Mock Mode**\n\nYou said: "${userMsg.text}".\n\nI am currently in local dev mode protecting your API quota. *(Turn on AI Mode ⚡ to use Gemini)*`;
        }

        updateChatMessages([
          ...messages,
          userMsg,
          {
            role: "ai",
            text: fakeText,
            time: new Date().toLocaleTimeString(),
          },
        ]);
        setLoading(false);
      }, 800);
      return; // Stop here, do not call API
    }

    // ============================================
    // ⚡ REAL GEMINI API CALL
    // ============================================
    
    // HARD LIMIT PROTECTION
    if (apiCount >= 20) {
      updateChatMessages([
        ...messages,
        userMsg,
        {
          role: "ai",
          text: `## ⚠️ API Limit Reached\n\nYou have used all 20 API requests.\n\nPlease switch to "Local Mock (Free)" mode.`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
      setLoading(false);
      // Turn off UI usage
      setUseAI(false); 
      return;
    }

    try {
      // ✅ Track successful API intent
      setApiCount((prev) => {
        const updated = prev + 1;
        localStorage.setItem("apiCount", updated);
        return updated;
      });

      const payload = { 
        skill, 
        input,
        context: chatDocument // The RAG chunk (if uploaded)
      };

      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const updateChatMessages = (newMessages) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: newMessages }
          : chat
      )
    );
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

        <button
          onClick={() => setUseAI(!useAI)}
          className={`w-full mb-3 p-2 rounded transition font-semibold flex items-center justify-between ${
            useAI 
              ? "bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
          }`}
        >
          <span>{useAI ? "Gemini AI" : "Local Mock (Free)"}</span>
          <span>{useAI ? "⚡ ON" : "💤 OFF"}</span>
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
          onClick={createNewChat}
          className="w-full mt-4 bg-green-600 p-2 rounded hover:bg-green-700 transition"
        >
          + New Chat
        </button>

        <button
          onClick={() => { setChats([]); localStorage.removeItem("chatList"); setCurrentChatId(null); }}
          className="w-full mt-2 bg-red-600 p-2 rounded hover:bg-red-700 transition"
        >
          Clear All Chats
        </button>

        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
          <p className="text-white font-semibold mb-2">Recent Chats</p>
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setCurrentChatId(chat.id)}
              className={`p-2 rounded cursor-pointer transition ${
                currentChatId === chat.id
                  ? "bg-blue-600 text-white"
                  : darkMode ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-black"
              }`}
            >
              {chat.title || "New Chat"}
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

      {/* Footer Info Area */}
      <div className="mt-6 pt-4 border-t border-gray-700 text-gray-400 text-sm space-y-1">
        <p>✔ Smart AI Engine</p>
        <p>✔ Skill-Based Prompts</p>
        <p className="text-yellow-400 font-bold mt-2">API Used: {apiCount} / 20</p>
      </div>

      {/* Main Chat */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div
          className={`p-4 border-b border-gray-800 flex justify-between items-center ${darkMode ? "bg-gray-900/40" : "bg-white/30"} backdrop-blur-md`}
        >
          <h1 className="text-lg font-semibold">Chat Assistant</h1>
          
          {/* Document Status UI */}
          {documents[currentChatId] && (
            <div className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full whitespace-nowrap">
              📄 Document Active
            </div>
          )}
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
                      if (!newText) return;

                      setMessages((prev) => {
                        const updated = [...prev];

                        // 1. update user message
                        updated[i].text = newText;

                        // 2. remove next AI response if exists
                        if (updated[i + 1] && updated[i + 1].role === "ai") {
                          updated.splice(i + 1, 1);
                        }

                        return updated;
                      });

                      // 3. simulate new AI response (mock streaming)
                      let fakeResponse = `
## Updated AI Response

You edited your message to:

"${newText}"

### 🔹 Explanation
This is a regenerated response based on your updated input.

### 🔹 Result
- Old response removed
- New response generated
- System behaves correctly
`;

                      let words = fakeResponse.split(" ");
                      let index = 0;

                      setMessages((prev) => [
                        ...prev,
                        {
                          role: "ai",
                          text: "",
                          time: new Date().toLocaleTimeString(),
                        },
                      ]);

                      const interval = setInterval(() => {
                        if (index >= words.length) {
                          clearInterval(interval);
                          return;
                        }

                        setMessages((prev) => {
                          const updated = [...prev];
                          updated[updated.length - 1].text += words[index] + " ";
                          return updated;
                        });

                        index++;
                      }, 30);
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
          {/* File Upload UI */}
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".txt,.md,.json,.csv" // simple text formats for now
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file || !currentChatId) return;

              // Extract text (simple extraction for text-based files)
              const text = await file.text();

              // Save document for current chat
              setDocuments((prev) => ({
                ...prev,
                [currentChatId]: text,
              }));

              const fileMsg = {
                role: "user",
                text: `📎 Uploaded: ${file.name}`,
                time: new Date().toLocaleTimeString(),
              };

              // Note: using the 'messages' helper
              updateChatMessages([...messages, fileMsg]);

              // Mock AI confirmation
              setTimeout(() => {
                updateChatMessages([
                  ...messages,
                  fileMsg,
                  {
                    role: "ai",
                    text: `✅ File "${file.name}" processed successfully. Its content is now available as context for this chat.`,
                    time: new Date().toLocaleTimeString(),
                  },
                ]);
              }, 1000);
            }}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-gray-700 px-4 py-3 rounded hover:bg-gray-600 transition flex items-center justify-center text-xl"
            title="Upload File"
          >
            📎
          </label>

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

