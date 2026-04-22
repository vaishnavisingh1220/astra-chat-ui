"use client";

import { useState } from "react";

export default function ChatInput({
  onSend,
  selectedModel,
  setSelectedModel,
}: any) {
  const [input, setInput] = useState("");

  return (
    <div>

      <div className="flex justify-between mb-2">
        <select
  value={selectedModel}
  onChange={(e) => setSelectedModel(e.target.value)}
  className="bg-[#020617] text-white border border-white/10 text-xs px-2 py-1 rounded"
>
  <option value="groq">⚡ Groq</option>
  <option value="openai">🧠 OpenAI</option>
  <option value="serpapi">🌐 SerpAPI</option>
</select>

        <label className="text-xs text-gray-400 cursor-pointer">
          📎 Attach
          <input type="file" className="hidden" />
        </label>
      </div>

      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Astra..."
          className="flex-1 bg-transparent outline-none text-white text-sm"
          onKeyDown={(e) => e.key === "Enter" && onSend(input)}
        />

        <button
          onClick={() => {
            onSend(input);
            setInput("");
          }}
          className="bg-blue-500 px-4 py-2 rounded-lg text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}