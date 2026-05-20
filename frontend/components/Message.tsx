"use client";

import { MessageType } from "./ChatWindow";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Message({
  msg,
  darkMode,
}: {
  msg: MessageType;
  darkMode: boolean;
}) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      
      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm
        ${
          isUser
            ? darkMode
    ? "bg-gradient-to-r from-[#020617] to-purple-600 text-white"
    : "bg-gradient-to-r from-purple-100 to-purple-300 text-black shadow-sm"
            : darkMode
            ? "bg-white/5 border border-white/10 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        {/* MESSAGE CONTENT */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          <ReactMarkdown
            components={{
              code(props: any) {
                const { inline, className, children, ...rest } = props;
                const match = /language-(\w+)/.exec(className || "");

                return !inline && match ? (
                  <div className="relative">
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
                      {...rest}
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
            {msg.content}
          </ReactMarkdown>
        </div>

        {/* PROVIDER */}
        {msg.provider && (
          <div className="text-[10px] text-gray-400 mt-2">
            via {msg.provider.toUpperCase()}
             {msg.provider.includes("llama") && "🦙"}
    {msg.provider === "groq" && "⚡"}
    {msg.provider === "gemini" && "✨"}
          </div>
        )}

        {/* SOURCES */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-2 text-xs">
            <div className="font-semibold">Sources:</div>
            {msg.sources.map((s, i) => (
              <a
                key={i}
                href={s.link}
                target="_blank"
                className="block text-blue-500 underline"
              >
                {s.title}
              </a>
            ))}
          </div>
        )}

        {/* TIME */}
        {msg.createdAt && (
          <div className="text-[10px] opacity-60 mt-2 text-right">
            {new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
}