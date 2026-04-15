"use client";

import { useRef, useState, useEffect } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";
import Sidebar from "./Sidebar";
import TypingIndicator from "./TypingIndicator";

export type MessageType = {
  id: number;
  text: string;
  sender: "user" | "bot";
  createdAt: Date;
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const [chats, setChats] = useState<any[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🌙 Dark mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // 📚 Load chats
  const loadChats = async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.error("Failed to load chats", err);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  // 💬 Send message
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: MessageType = {
      id: Date.now(),
      text,
      sender: "user",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text, chatId }), // ✅ IMPORTANT
      });

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      setChatId(data.chatId);

      const botMsg: MessageType = {
        id: Date.now() + 1,
        text: data.reply || "⚠️ No response",
        sender: "bot",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);

      audioRef.current?.play().catch(() => {});

      // 🔥 reload chats
      await loadChats();

    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "⚠️ Failed to get response",
          sender: "bot",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onClear={handleClear}
        onNewChat={handleNewChat}
        chats={chats}
        setMessages={setMessages}
        setChatId={setChatId}
      />

      {/* Sound */}
      <audio ref={audioRef}>
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* Main */}
      <div
        className={`flex flex-col flex-1
        ${darkMode
          ? "bg-gradient-to-br from-[#020617] via-[#0F172A] to-[#1E1B4B]"
          : "bg-gradient-to-br from-white to-blue-100"
        }`}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <img
              src="/astra-avatar.png"
              className="w-20 h-20 mb-4 rounded-full"
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
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.map((msg) => (
                <Message key={msg.id} msg={msg} />
              ))}

              {isTyping && <TypingIndicator />}
            </div>

            <div className="px-6 pb-6">
              <ChatInput onSend={sendMessage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}