"use client";

import { useState } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";

export type MessageType = {
  id: number;
  text: string;
  sender: "user" | "bot";
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [darkMode, setDarkMode] = useState(true);

  const sendMessage = (text: string) => {
    const userMsg: MessageType = {
      id: Date.now(),
      text,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const botMsg: MessageType = {
        id: Date.now() + 1,
        text: "That’s interesting ✨ Let’s explore that...",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex flex-col h-screen 
        bg-gradient-to-br 
        from-white to-blue-100 
        dark:from-[#020617] dark:via-[#0F172A] dark:to-[#1E1B4B]
        transition-all">

        {/* Toggle Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-full text-sm 
            bg-white/20 dark:bg-white/10 
            backdrop-blur-md text-white border border-white/20"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>

        {/* CENTERED HERO (No messages yet) */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-4">

            <img
              src="/astra-avatar.png"
              className="w-20 h-20 rounded-full shadow-lg mb-4"
            />

            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
              Astra AI ✨
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              What can I help you explore today?
            </p>

            <div className="mt-6 w-full max-w-xl">
              <ChatInput onSend={sendMessage} />
            </div>
          </div>
        ) : (
          <>
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {messages.map((msg) => (
                <Message key={msg.id} msg={msg} />
              ))}
            </div>

            {/* Input bottom */}
            <div className="px-4 pb-6">
              <ChatInput onSend={sendMessage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}