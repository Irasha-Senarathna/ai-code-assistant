import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export default function ChatMessage({ msg }) {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    await navigator.clipboard.writeText(msg.text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`group relative max-w-2xl p-4 rounded-2xl shadow-md transition-all duration-300 whitespace-pre-wrap ${
        msg.role === "user"
          ? "bg-blue-600 ml-auto text-white"
          : "bg-gray-800 text-white hover:bg-gray-700"
      }`}
    >
      {/* Copy button */}
      {msg.role === "ai" && (
        <button
          onClick={copyText}
          className="opacity-0 group-hover:opacity-100 transition absolute top-2 right-2 text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      )}

      {/* Markdown */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return <div className="mb-2">{children}</div>; // 🔥 FIX DOM ERROR
          },
          code({ inline, className, children }) {
            const match = /language-(\w+)/.exec(className || "");

            return !inline ? (
              <SyntaxHighlighter
                language={match ? match[1] : "javascript"}
                PreTag="div"
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-700 px-1 rounded">
                {children}
              </code>
            );
          },
        }}
      >
        {msg.text || ""}
      </ReactMarkdown>
    </div>
  );
}