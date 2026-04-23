"use client";

import { Groq } from "groq-sdk";
import { useState } from "react";

type ChatInputProps = {
  onSend: (text: string) => void;
  darkMode: boolean;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  model: string;
  setModel: (val: string) => void;
};


export default function ChatInput({
  onSend,
  selectedModel,
  setSelectedModel,
  model,
  setModel,
  darkMode,
  setDarkMode,
}: any) {
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
      className={`w-full p-3 rounded-2xl border transition space-y-2
      ${
        darkMode
          ? "bg-[#020617] border-white/10"
          : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      {/* 🔝 TOP ROW */}
      <div className="flex justify-between items-center">
        
        {/* MODEL SELECT */}
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className={`text-xs px-2 py-1 rounded outline-none transition
          ${
            darkMode
              ? "bg-black/40 text-white border border-white/10"
              : "bg-gray-100 text-black border border-gray-300"
          }`}
        >
          <option value="groq">⚡ Groq</option>
          <option value="openrouter">🧠 OpenRouter</option>
          <option value="serpapi">🌐 SerpApi</option>
        </select>

        {/* ATTACH */}
        <label
          className={`text-xs cursor-pointer flex items-center gap-1
          ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          📎 Attach
          <input type="file" className="hidden" />
        </label>
      </div>

      {/* 💬 INPUT BAR */}
      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2 transition
        focus-within:ring-2 focus-within:ring-purple-500/30
        ${
          darkMode
            ? "bg-black/40 border border-white/10"
            : "bg-gray-50 border border-purple-200"
        }`}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Astra..."
          className={`flex-1 bg-transparent outline-none text-sm
          ${
            darkMode
              ? " bg-transparent text-white placeholder-gray-400"
              : "bg-transparent text-black placeholder-gray-500"
          }`}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        {/* 🚀 SEND BUTTON */}
        <button
          onClick={handleSend}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition active:scale-95
          ${
            darkMode
              ? "bg-gradient-to-r from-[#020617] to-purple-600 text-white hover:opacity-90"
              : "bg-gradient-to-r from-purple-100 to-purple-300 text-black hover:opacity-90 shadow-sm"
          }`}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}