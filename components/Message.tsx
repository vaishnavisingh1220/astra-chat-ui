"use client";

import { MessageType } from "./ChatWindow";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Message({ msg, darkMode }: { msg: MessageType; darkMode: boolean }) {
  const isUser = msg.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-md
        ${
  isUser
    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
    : darkMode
    ? "bg-white/5 border border-white/10 text-white"
    : "bg-gray-200 text-black"
}}}`}
      >
        {/* ✅ WRAPPER FOR STYLING */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          
          <ReactMarkdown
            components={{
              code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");

                return !inline && match ? (
                  <div className="relative">
                    
                    {/* Copy button */}
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(String(children))
                      }
                      className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                    >
                      Copy
                    </button>

                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg text-xs"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-white/10 px-1 py-0.5 rounded text-xs">
                    {children}
                  </code>
                );
              },
            }}
          >
            {msg.text}
          </ReactMarkdown>

        </div>

        {/* 🔗 SOURCES */}
        {msg.sender === "bot" && msg.sources?.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-gray-400">Sources</p>

            {msg.sources!.map((src, i) => (
              <a
                key={`${msg.id}-src-${i}`}
                href={src.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded-lg 
                bg-white/5 hover:bg-white/10 
                border border-white/10 transition"
              >
                <p className="text-xs font-medium truncate">
                  🔗 {src.title}
                </p>

                <p className="text-[10px] text-gray-400 truncate">
                  {src.link}
                </p>
              </a>
            ))}
          </div>
        )}

        {/* ⏱ TIME */}
        <p className="text-[10px] mt-2 opacity-60 text-right">
          {new Date(msg.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}