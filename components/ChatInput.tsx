"use client";

import { useState } from "react";

export default function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [input, setInput] = useState("");

  const isDisabled = !input.trim();

  const handleSend = () => {
    if (isDisabled) return;
    onSend(input);
    setInput(""); // ✅ clears input
  };

  return (
    <div className="relative flex items-center gap-2 
      bg-white/70 dark:bg-white/5 
      backdrop-blur-xl 
      border border-white/20 
      rounded-full px-4 py-2 shadow-lg">

      <input
        type="text"
        value={input} // ✅ VERY IMPORTANT
        onChange={(e) => setInput(e.target.value)} // ✅ REQUIRED
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Ask Astra anything..."
        className="flex-1 bg-transparent outline-none text-sm 
        text-gray-800 dark:text-white placeholder-gray-400"
      />

      <button
        onClick={handleSend}
        disabled={isDisabled}
        className={`px-4 py-2 rounded-full text-sm transition
        ${isDisabled
          ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105"
        }`}
      >
        Send
      </button>
    </div>
  );
}