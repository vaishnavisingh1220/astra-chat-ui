import { useState } from "react";

export default function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="relative flex items-center gap-2 
      bg-white/70 dark:bg-white/5 
      backdrop-blur-xl 
      border border-white/20 
      rounded-full px-4 py-2 shadow-lg">

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full 
        bg-gradient-to-r from-blue-500 to-purple-500 
        opacity-20 blur-md"></div>

      <input
        type="text"
        placeholder="Ask Astra anything..."
        className="flex-1 bg-transparent outline-none text-sm 
        text-gray-800 dark:text-white placeholder-gray-400"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      <button
        onClick={handleSend}
        className="bg-gradient-to-r from-blue-500 to-purple-500 
        hover:scale-105 transition transform
        text-white px-4 py-2 rounded-full text-sm shadow-md"
      >
        ✨
      </button>
    </div>
  );
}