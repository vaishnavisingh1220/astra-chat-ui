"use client";

import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";
import Sidebar from "./Sidebar";
import TypingIndicator from "./TypingIndicator";
import { useSession } from "next-auth/react";

export type MessageType = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
 sources?: { title: string; link: string }[];
 provider?: string;
};

export default function ChatWindow() {
  const { data: session } = useSession();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [collapsed, setCollapsed] = useState(false);

  // 🔥 THREAD STATE
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [model, setModel] = useState("auto");

  // 🌙 THEME
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

  // =========================
// 🧠 THREAD FUNCTIONS
// =========================

const loadThreads = async () => {
  const res = await fetch("/api/threads");
  const data = await res.json();
  setThreads(data);
};

useEffect(() => {
  loadThreads();
}, []);

const createThread = async () => {
  console.log("creating thread"); // debug

  const res = await fetch("/api/threads", {
    method: "POST",
  });

  const data = await res.json();

  setThreads((prev) => [data, ...prev]);
  setActiveThreadId(data._id);
  setMessages([]);

  return data._id;
};

const loadThreadMessages = async (id: string) => {
  console.log("loading thread:", id); // debug

  setActiveThreadId(id);

  const res = await fetch(`/api/messages?threadId=${id}`);
  const data = await res.json();

  console.log("MESSAGES:", data); 

  setMessages(data || []);
};

// =========================
// 💬 SEND MESSAGE (UPDATED)
// =========================

const sendMessage = async (text: string) => {
  if (!text.trim()) return;

  let threadId = activeThreadId;

  if (!threadId) {
    threadId = await createThread();
  }

  setIsTyping(true);

  // ✅ Add user message instantly
  setMessages((prev) => [
    ...prev,
    {
      _id: Date.now().toString(),
      role: "user",
      content: text,
    },
  ]);

  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        threadId,
        content: text,
        model,
      }),
    });

    // ✅ Handle API failure safely
    if (!res.ok) {
      console.error("API error:", res.status);
      throw new Error("API failed");
    }

    let data;
    try {
      data = await res.json();
      console.log("API RESPONSE FULL:", JSON.stringify(data, null, 2));
    } catch {
      throw new Error("Invalid JSON response");
    }

    const { reply, provider, sources } = data;

    // ✅ fallback if reply missing
    const finalReply = reply || "⚠️ No response generated";

    // ✅ Add empty assistant message (stream target)
    setMessages((prev) => [
      ...prev,
      {
        _id: "streaming",
        role: "assistant",
        content: "",
        provider,
        sources,
      },
    ]);

    let currentText = "";

    // 🔥 STREAMING LOOP (safe)
    for (let i = 0; i < finalReply.length; i++) {
      currentText += finalReply[i];

      await new Promise((r) => setTimeout(r, 12));

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        if (updated[lastIndex]?.role === "assistant") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: currentText,
          };
        }

        return updated;
      });
    }

    // ✅ Replace temp streaming ID safely
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === "streaming"
          ? { ...msg, _id: Date.now().toString() }
          : msg
      )
    );

// ✅ SAVE AI MESSAGE TO DB
await fetch("/api/messages/save", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    threadId,
    content: currentText,
  }),
});

    // ✅ Refresh sidebar
    loadThreads();

  } catch (err) {
    console.error("Send error:", err);

    // ❌ graceful error message
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        role: "assistant",
        content: "⚠️ Failed to generate response",
      },
    ]);
  } finally {
    setIsTyping(false);
  }
};

// clear 
const handleClear = async () => {
  if (!activeThreadId) return;

  try {
    await fetch(`/api/messages/clear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ threadId: activeThreadId }),
    });

    setMessages([]); // clear UI

  } catch (err) {
    console.error("Clear failed:", err);
  }
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
        /*onClear={handleClear}
        onNewChat={handleNewChat} */ 
        threads={threads} //
        loadThreadMessages={loadThreadMessages} 
        activeThreadId={activeThreadId} 
        onThreadClick={loadThreadMessages}
        onNewChat={createThread}
        onClear={handleClear}
      />

      {/* SOUND */}
      <audio ref={audioRef}>
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* MAIN */}
      <div
        className={`flex flex-col flex-1 transition ${
          darkMode
            ? "bg-gradient-to-b from-[#020617] via-[#020617] to-[#0F172A]"
            : "bg-gray-100"
        }`}
      >
        {/* TOP RIGHT */}
        <div className="w-full flex justify-end items-center gap-3 p-4">
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
              <ChatInput onSend={sendMessage} darkMode={darkMode} model={model} setModel={setModel} />
            </div>
          </div>
        ) : (
          <>
            {/* MESSAGES */}
           <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
  {messages.map((msg, index) => (
    <Message
      key={msg._id || index} // ✅ FIXED
      msg={msg}
      darkMode={darkMode}
    />
  ))}

              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-white/10">
              <ChatInput onSend={sendMessage} darkMode={darkMode} model={model} setModel={setModel} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}