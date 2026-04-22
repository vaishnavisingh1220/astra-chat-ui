"use client";

import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";
import Sidebar from "./Sidebar";
import TypingIndicator from "./TypingIndicator";
import { useSession, signOut } from "next-auth/react";

export type MessageType = {
  id: number;
  text: string;
  sender: "user" | "bot";
  createdAt: Date;
  sources?: { title: string; link: string }[];
};

export default function ChatWindow() {
  const { data: session } = useSession();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [chats, setChats] = useState<any[]>([]);
  console.log("CHATS STATE:", chats);

  const [chatId, setChatId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [collapsed, setCollapsed] = useState(false);

useEffect(() => {
  const saved = localStorage.getItem("theme");
  if (saved) setDarkMode(saved === "dark");
}, []);

useEffect(() => {
  localStorage.setItem("theme", darkMode ? "dark" : "light");
}, [darkMode]);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 📚 LOAD CHATS (SAFE)
  const loadChats = async () => {
    try {
      const res = await fetch("/api/chats");

      if (!res.ok) {
        console.error("Chats API failed:", res.status);
        return;
      }

      const text = await res.text();
      if (!text) return;

      const data = JSON.parse(text);
      setChats(data);

    } catch (err) {
      console.error("Failed to load chats", err);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  // 💬 SEND MESSAGE
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
        body: JSON.stringify({ message: text, chatId }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API ERROR:", data);
        throw new Error(data.error || "API failed");
      }

      setChatId(data.chatId);

      const botMsg: MessageType = {
        id: Date.now() + 1,
        text: data.reply,
        sender: "bot",
        createdAt: new Date(),
        sources: data.sources || [],
      };

      // 🔥 STREAMING EFFECT (fake typing)
      let currentText = "";
      for (let char of botMsg.text) {
        currentText += char;

        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];

          if (last?.sender === "bot") {
            last.text = currentText;
            return [...copy];
          } else {
            return [...copy, { ...botMsg, text: currentText }];
          }
        });

        await new Promise((r) => setTimeout(r, 10));
      }

      audioRef.current?.play().catch(() => {});

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

  // 🧹 CLEAR CHAT
  const handleClear = () => {
    setMessages([]);
    setChatId(null);
  };

  // ➕ NEW CHAT
  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
  };

  return (
    <div
  className={`flex h-screen transition ${
    darkMode
      ? "bg-[#020617] text-white"
      : "bg-gray-100 text-black"
  }`}
>

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onClear={handleClear}
        onNewChat={handleNewChat}
        chats={chats}
        setMessages={setMessages}
        setChatId={setChatId}
        currentChatId={chatId}
        setChats={setChats}
      />

      {/* SOUND */}
      <audio ref={audioRef}>
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* MAIN */}
      <div
  className={`flex flex-col flex-1 transition ${
    darkMode ? "bg-gradient-to-b from-[#020617] via-[#020617] to-[#0F172A]" : "bg-gray-100"
  }`}
>
        
        {/* 🔝 TOP RIGHT CONTROLS */}
        <div className="w-full flex justify-end items-center gap-3 p-4">

  {/* 🌙 DARK MODE TOGGLE */}
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
  >
    {darkMode ? "🌙" : "☀️"}
  </button>

</div>
        {/* EMPTY STATE */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">

            <img
              src="/astra-avatar.png"
              className="w-20 h-20 mb-4 rounded-full"
            />

           <h1 className={`text-3xl font-semibold ${
  darkMode ? "text-white" : "text-black"
}`}>
              Astra AI ✨
            </h1>

            <p className="text-gray-400 mt-2">
              What can I help you explore today?
            </p>

            <div className="mt-6 w-full max-w-xl">
              <ChatInput onSend={sendMessage} />
            </div>
          </div>
        ) : (
          <>
            {/* MESSAGES */}
            <div
  className={`flex-1 overflow-y-auto p-6 transition ${
    darkMode ? "" : "bg-gray-100"
  }`}
>

              {messages.map((msg) => (
                <Message key={msg.id} msg={msg} darkMode={darkMode} />
                
              ))}

              {isTyping && <TypingIndicator />}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
           <div className="p-4 border-t border-white/10">
  <ChatInput onSend={sendMessage} darkMode={darkMode} />
</div>
          </>
        )}
      </div>
    </div>
  );
}