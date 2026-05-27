"use client";

import { useState } from "react";

type ChatInputProps = {
  onSend: (text: string) => void;
  darkMode: boolean;
  model: string;
  setModel: (val: string) => void;
  onFilesSelected?: (files: File[]) => void;
  attachedFiles?: string[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function ChatInput({ onSend, model, setModel, darkMode, onFilesSelected, attachedFiles, setAttachedFiles }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  

  const handleSend = async () => {
  if (!input.trim() || loading) return;

  setLoading(true);
  await onSend(input);
  setInput("");
  setLoading(false);
};

 return (
  <div
    className={`w-full p-3 rounded-2xl border transition-all duration-300 space-y-3
    ${
      darkMode
        ? "bg-[#111827] border-[#2B3548] shadow-[0_0_20px_rgba(0,0,0,0.25)]"
        : "bg-white border-[#E5E7EB] shadow-sm"
    }`}
  >
    {/* 🔝 TOP ROW */}

    <div className="flex justify-between items-center">

      {/* MODEL SELECT */}

      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className={`text-xs px-3 py-2 rounded-xl outline-none transition border
        ${
          darkMode
            ? "bg-[#0B1020] text-[#F3F4F6] border-[#2B3548] focus:border-[#7C5CFF]"
            : "bg-[#F7F9FC] text-[#111827] border-[#E5E7EB] focus:border-[#6D5EF5]"
        }`}
      >
        <option value="groq">⚡ Groq</option>
        <option value="openrouter">🧠 OpenRouter</option>
        <option value="serpapi">🌐 SerpApi</option>
      </select>
    </div>

    {/* 📎 ATTACHED FILES */}

    {attachedFiles.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-2">
        {attachedFiles.map((file, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition
            ${
              darkMode
                ? "bg-[#1A2236] border-[#2B3548] text-[#E5E7EB]"
                : "bg-[#F3F4F6] border-[#E5E7EB] text-[#111827]"
            }`}
          >
            📄 {file}

            <button
              onClick={() =>
                setAttachedFiles((prev) =>
                  prev.filter((_, i) => i !== index)
                )
              }
              className={`transition ${
                darkMode
                  ? "text-[#9CA3AF] hover:text-red-400"
                  : "text-[#6B7280] hover:text-red-500"
              }`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    )}

    {/* 💬 INPUT BAR */}

    <div
      className={`flex items-center gap-2 rounded-2xl px-3 py-2 border transition-all duration-300
      focus-within:ring-2
      ${
        darkMode
          ? "bg-[#0B1020] border-[#2B3548] focus-within:ring-[#7C5CFF]/20"
          : "bg-[#F7F9FC] border-[#E5E7EB] focus-within:ring-[#6D5EF5]/20"
      }`}
    >
      {/* INPUT */}

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask Astra..."
        className={`flex-1 bg-transparent outline-none text-sm
        ${
          darkMode
            ? "text-[#F3F4F6] placeholder-[#6B7280]"
            : "text-[#111827] placeholder-[#9CA3AF]"
        }`}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      {/* FILE UPLOAD */}

      <label className="cursor-pointer">
        <input
          type="file"
          accept=".pdf"
          multiple
          hidden
          onChange={(e) => {
            if (!e.target.files) return;

            const files = Array.from(e.target.files);

            onFilesSelected?.(files);
          }}
        />

        <div
          className={`p-2 rounded-xl transition
          ${
            darkMode
              ? "hover:bg-[#1A2236] text-[#9CA3AF]"
              : "hover:bg-[#EEF2FF] text-[#6B7280]"
          }`}
        >
          📎
        </div>
      </label>

      {/* 🚀 SEND BUTTON */}

      <button
        onClick={handleSend}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95
        ${
          darkMode
            ? "bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white hover:opacity-95 shadow-[0_0_20px_rgba(124,92,255,0.18)]"
            : "bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white hover:opacity-95 shadow-sm"
        }`}
      >
        {loading ? "..." : "Send"}
      </button>
    </div>
  </div>
);
}