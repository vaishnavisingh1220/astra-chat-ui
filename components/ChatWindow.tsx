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
  
  const [chats, setChats] = useState<any[]>([]);
  console.log("CHATS STATE:", chats);

  const [chatId, setChatId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        chats={chats}
        setMessages={setMessages}
        setChatId={setChatId}
      />

      {/* SOUND */}
      <audio ref={audioRef}>
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* MAIN */}
      <div className="flex flex-col flex-1 relative
        bg-gradient-to-br from-[#020617] via-[#0F172A] to-[#1E1B4B]">

        {/* 🔝 TOP RIGHT CONTROLS */}
        <div className="absolute top-4 right-6 flex items-center gap-3 z-50">

          {/* CLEAR */}
          <button
            onClick={handleClear}
            className="p-2 rounded-full bg-white/10 hover:bg-red-500/20 transition"
            title="Clear chat"
          >
            🧹
          </button>

          {/* USER */}
          {session?.user?.image ? (
            <img
              src={session.user.image}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs">
              {session?.user?.email?.[0]}
            </div>
          )}

          {/* LOGOUT */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded hover:bg-red-500/40 transition"
          >
            Logout
          </button>

        </div>

        {/* EMPTY STATE */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">

            <img
              src="/astra-avatar.png"
              className="w-20 h-20 mb-4 rounded-full"
            />

            <h1 className="text-3xl font-semibold text-white">
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
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scroll">

              {messages.map((msg) => (
                <Message key={msg.id} msg={msg} />
              ))}

              {isTyping && <TypingIndicator />}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="px-6 pb-6">
              <ChatInput onSend={sendMessage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}