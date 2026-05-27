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
  <div
    className={`flex animate-fadeIn ${
      isUser ? "justify-end" : "justify-start"
    }`}
  >
    <div
      className={`max-w-[75%] px-4 py-3 rounded-2xl border shadow-sm transition-all duration-300
      ${
        isUser
          ? darkMode
            ? "bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white border-transparent shadow-[0_0_20px_rgba(124,92,255,0.18)]"
            : "bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white border-transparent shadow-sm"
          : darkMode
          ? "bg-[#111827] border-[#2B3548] text-[#F3F4F6]"
          : "bg-white border-[#E5E7EB] text-[#111827]"
      }`}
    >
      {/* MESSAGE CONTENT */}

      <div className="text-sm leading-7 whitespace-pre-wrap break-words">
        <ReactMarkdown
          components={{
            code(props: any) {
              const {
                inline,
                className,
                children,
                ...rest
              } = props;

              const match = /language-(\w+)/.exec(
                className || ""
              );

              return !inline && match ? (
                <div className="relative mt-3">
                  
                  {/* COPY BUTTON */}

                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        String(children)
                      )
                    }
                    className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-lg transition
                    ${
                      darkMode
                        ? "bg-[#1A2236] text-[#E5E7EB] hover:bg-[#202A40]"
                        : "bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB]"
                    }`}
                  >
                    Copy
                  </button>

                  {/* CODE BLOCK */}

                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-xl text-xs !bg-[#0B1020]"
                    {...rest}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code
                  className={`px-1.5 py-0.5 rounded text-xs
                  ${
                    darkMode
                      ? "bg-[#1A2236] text-[#E5E7EB]"
                      : "bg-[#EEF2FF] text-[#111827]"
                  }`}
                >
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
        <div
          className={`text-[10px] mt-3 flex items-center gap-1
          ${
            darkMode
              ? "text-[#9CA3AF]"
              : "text-[#6B7280]"
          }`}
        >
          <span>
            via {msg.provider.toUpperCase()}
          </span>

          {msg.provider.includes("llama") && "🦙"}
          {msg.provider === "groq" && "⚡"}
          {msg.provider === "gemini" && "✨"}
        </div>
      )}

      {/* SOURCES */}

      {msg.sources && msg.sources.length > 0 && (
        <div className="mt-3 text-xs">
          
          <div
            className={`font-semibold mb-2
            ${
              darkMode
                ? "text-[#E5E7EB]"
                : "text-[#111827]"
            }`}
          >
            Sources
          </div>

          <div className="space-y-2">
            {msg.sources.map((s, i) => (
              <a
                key={i}
                href={s.link}
                target="_blank"
                className={`block px-3 py-2 rounded-xl border transition
                ${
                  darkMode
                    ? "bg-[#1A2236] border-[#2B3548] text-[#A5B4FC] hover:bg-[#202A40]"
                    : "bg-[#F7F9FC] border-[#E5E7EB] text-[#5B5BD6] hover:bg-[#EEF2FF]"
                }`}
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* TIME */}

      {msg.createdAt && (
        <div
          className={`text-[10px] mt-3 text-right
          ${
            darkMode
              ? "text-[#6B7280]"
              : "text-[#9CA3AF]"
          }`}
        >
          {new Date(msg.createdAt).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </div>
      )}
    </div>
  </div>
);
}