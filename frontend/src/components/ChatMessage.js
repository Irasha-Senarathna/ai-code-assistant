import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export default function ChatMessage({ msg }) {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    await navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`relative max-w-xl p-4 rounded-2xl shadow-lg backdrop-blur-md border border-gray-700/40 whitespace-pre-wrap ${
        msg.role === "user"
          ? "bg-blue-600 ml-auto text-white"
          : "bg-gray-800 text-white"
      }`}
    >
      {/* Copy button only for AI */}
      {msg.role === "ai" && (
        <button
          onClick={copyText}
          className="absolute top-2 right-2 text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      )}

      {/* Markdown Renderer */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, children }) {
            return !inline ? (
              <SyntaxHighlighter language="javascript">
                {String(children)}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-700 px-1 rounded">
                {children}
              </code>
            );
          },
        }}
      >
        {msg.text}
      </ReactMarkdown>
    </div>
  );
}