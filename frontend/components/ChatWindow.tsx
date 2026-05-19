
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Message from "./Message";
import ChatInput from "./ChatInput";
import Sidebar from "./Sidebar";
import TypingIndicator from "./TypingIndicator";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

import API_BASE from "@/lib/api";

export type MessageType = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  sources?: { title: string; link: string }[];
  provider?: string;
};

type ThreadType = {
  _id: string;
  title?: string;
  userId?: string;
  createdAt?: string;
};

type AppSession = Session & { accessToken?: string };

export default function ChatWindow() {
  const { data: session, status } = useSession();
  console.log("SESSION:", session);
  console.log("STATUS:", status);

  const token = (session as AppSession)?.accessToken;
  console.log("TOKEN:", token);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      if (typeof window === "undefined") return true;
      const saved = localStorage.getItem("theme");
      return saved ? saved === "dark" : true;
    } catch {
      return true;
    }
  });

  const [collapsed, setCollapsed] = useState(false);

  // 🔥 THREAD STATE
  const [threads, setThreads] = useState<ThreadType[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [model, setModel] = useState("auto");

  type CryptoWithRandomUUID = typeof crypto & { randomUUID?: () => string };

  const generateId = () => {
    try {
      if (typeof crypto !== "undefined" && typeof (crypto as CryptoWithRandomUUID).randomUUID === "function") {
        return (crypto as CryptoWithRandomUUID).randomUUID();
      }
    } catch {}

    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  };

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

 const loadThreads = useCallback(async () => {
  try {
    console.log("TOKEN:", token);

    const res = await fetch(
      `${API_BASE}/api/chat/threads`,
      {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    console.log("THREADS RESPONSE:", data);

    setThreads(data.data || []);

  } catch (err) {
    console.error("Load threads error:", err);
  }
}, [token]);

 useEffect(() => {
  if (token) {
    const id = setTimeout(() => {
      loadThreads();
    }, 0);

    return () => clearTimeout(id);
  }
}, [status, token, loadThreads]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="rounded-2xl bg-white/5 p-8 border border-white/10">
          <p className="text-lg">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (!session || !token) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="rounded-2xl bg-white/5 p-8 border border-white/10 text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-4">Not authenticated</h1>
          <p className="mb-4 text-gray-300">
            You must be logged in to use the chat. Please sign in first.
          </p>
          <a
            href="/login"
            className="inline-block rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-500"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const createThread = async (): Promise<string | null> => {
  try {
    console.log("CREATING THREAD WITH TOKEN:", token);

    const res = await fetch(
      `${API_BASE}/api/chat/threads`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const status = res.status;
    const raw = await res.text();
    let data: Record<string, unknown> = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error("CREATE THREAD: invalid JSON response", raw, err);
      data = {};
    }

    console.log("CREATE THREAD STATUS:", status);
    console.log("CREATE THREAD RESPONSE:", data, "(raw:", raw, ")");

    if (!res.ok) {
      console.error("CREATE THREAD FAILED:", status, data);
      setMessages((prev) => [
        ...prev,
        {
          _id: generateId(),
          role: "assistant",
          content: `⚠️ Failed to create thread: ${data.message || status}`,
        },
      ]);
      return null;
    }

    const thread = (data.data || data.thread || data) as ThreadType;

    console.log("THREAD OBJECT:", thread);

    if (!thread || !thread._id) {
      console.error("INVALID THREAD:", thread);
      setMessages((prev) => [
        ...prev,
        {
          _id: generateId(),
          role: "assistant",
          content: "⚠️ Invalid thread received from server.",
        },
      ]);
      return null;
    }

    setThreads((prev) => [thread, ...prev]);

    setActiveThreadId(thread._id);

    setMessages([]);

    return thread._id;

  } catch (err) {
    console.error("Create thread error:", err);
    return null;
  }
};

/*
const createThread = async () => {
  try {
    console.log("Creating thread...");

    const res = await fetch(
      `${API_BASE}/api/chat/threads`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    console.log("CREATE THREAD RESPONSE:", data);

    if (!res.ok || !data.success) {
      console.error("CREATE THREAD FAILED:", data);
      return null;
    }

    const thread = data.data;

    if (!thread?._id) {
      console.error("INVALID THREAD:", thread);
      return null;
    }

    // ✅ Update state
    setThreads((prev) => [thread, ...prev]);

    setActiveThreadId(thread._id);

    return thread._id;

  } catch (err) {
    console.error("CREATE THREAD ERROR:", err);
    return null;
  }
};
*/
  const loadThreadMessages = async (id: string) => {
    try {
      console.log("loading thread:", id);

      setActiveThreadId(id);

      const res = await fetch(
        `${API_BASE}/api/chat/messages/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("MESSAGES:", data);

      setMessages(data.data || []);
    } catch (err) {
      console.error("Load messages error:", err);
    }
  };



  // =========================
  // 💬 SEND MESSAGE
  // =========================

 const sendMessage = async (text: string) => {
  if (!text.trim()) return;
  if (!token) {
    console.log("TOKEN:", token);
    console.error("No token available");
      setMessages((prev) => [
        ...prev,
        {
          _id: generateId(),
          role: "assistant",
          content: "⚠️ Authentication required. Please log in again.",
        },
      ]);
    return;
  }

  setIsTyping(true);

  let threadId = activeThreadId;

  try {
    if (!threadId) {
      threadId = await createThread();
    }

    if (!threadId) {
      console.error("No thread available");
      setMessages((prev) => [
        ...prev,
        {
          _id: generateId(),
          role: "assistant",
          content: "⚠️ Unable to create a chat thread. Please try again.",
        },
      ]);
      return;
    }

    setActiveThreadId(threadId);

    const tempUserMessage = {
      _id: generateId(),
      role: "user" as const,
      content: text,
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    console.log("TOKEN:", token);
    console.log("SENDING MESSAGE:", { threadId, text });

    const res = await fetch(`${API_BASE}/api/chat/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ threadId, text }),
    });

    const raw = await res.text();
    let data: {
      success?: boolean;
      message?: string;
      error?: string;
      data?: { aiMessage?: { content?: string } };
    } = {};

    try {
      if (raw) {
        data = JSON.parse(raw) as typeof data;
      }
    } catch (parseError) {
      console.error("INVALID JSON RESPONSE:", raw, parseError);
      setMessages((prev) => [
        ...prev,
        {
          _id: generateId(),
          role: "assistant",
          content: "⚠️ Received an invalid response from the server.",
        },
      ]);
      return;
    }

    if (typeof data !== "object" || data === null) {
      console.error("INVALID JSON RESPONSE OBJECT:", raw);
      setMessages((prev) => [
        ...prev,
        {
          _id: generateId(),
          role: "assistant",
          content: "⚠️ Received an invalid response from the server.",
        },
      ]);
      return;
    }

    console.log("STATUS:", res.status);
    console.log("MESSAGE RESPONSE:", data);

    if (!res.ok || data.success === false) {
      const errorMessage =
        data?.message || data?.error || raw || "Failed to generate response";
      console.error("MESSAGE FAILED:", errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          _id: generateId(),
          role: "assistant",
          content: `⚠️ ${errorMessage}`,
        },
      ]);
      return;
    }

    const aiMessage = data?.data?.aiMessage ?? {
      role: "assistant",
      content: data?.message || "⚠️ No response generated",
    };

    const finalReply = aiMessage?.content || "⚠️ No response generated";

      setMessages((prev) => [
      ...prev,
      {
        _id: "streaming",
        role: "assistant",
        content: "",
      },
    ]);

    let currentText = "";
    for (let i = 0; i < finalReply.length; i++) {
      currentText += finalReply[i];
      await new Promise((r) => setTimeout(r, 10));
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

    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === "streaming"
          ? {
                ...msg,
                _id: generateId(),
              }
          : msg
      )
    );

    loadThreads();
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    setMessages((prev) => [
      ...prev,
      {
        _id: generateId(),
        role: "assistant",
        content: "⚠️ Failed to generate response",
      },
    ]);
  } finally {
    setIsTyping(false);
  }
};


/*
const sendMessage = async (text: string) => {

  if (!token) {
  console.error("No token available");
  return;
}

  setIsTyping(true);

  try {
    let threadId = activeThreadId;

    // ✅ Auto-create thread
    if (!threadId) {
      threadId = await createThread();
    }

    if (!threadId) {
      console.error("No thread available");
      return;
    }

    console.log("SENDING MESSAGE:", {
      threadId,
      text,
    });

    const res = await fetch(
      `${API_BASE}/api/chat/messages`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          threadId,
          text,
        }),
      }
    );

   const raw = await res.text();

console.log("RAW RESPONSE:", raw);

let data;

try {
  data = JSON.parse(raw);
} catch (error) {
  console.error("INVALID JSON RESPONSE:", raw, error);
  return;
}

    console.log("MESSAGE RESPONSE:", data);

    if (!res.ok || !data.success) {
      console.error("MESSAGE FAILED:", data);
      return;
    }

    // ✅ Add messages to UI
    setMessages((prev) => [
      ...prev,
      data.data.userMessage,
      data.data.aiMessage,
    ]);

    // ✅ Refresh threads
    loadThreads();

  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
  } finally {
    setIsTyping(false);
  }
};
*/

  // =========================
  // 🗑 CLEAR CHAT (TEMPORARILY UI ONLY)
  // =========================

  const handleClear = async () => {
    setMessages([]);
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
        threads={threads}
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
            <Image
              src="/astra-avatar.png"
              alt="Astra avatar"
              width={80}
              height={80}
              className="w-20 h-20 mb-4 rounded-full"
            />

            <h1
              className={`text-3xl font-semibold ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              Astra AI ✨
            </h1>

            <p className="text-gray-400 mt-2">
              What can I help you explore today?
            </p>

            <div className="mt-6 w-full max-w-xl">
              <ChatInput
                onSend={sendMessage}
                darkMode={darkMode}
                model={model}
                setModel={setModel}
              />
            </div>
          </div>
        ) : (
          <>
            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
              {messages.map((msg, index) => (
                <Message
                  key={msg._id || index}
                  msg={msg}
                  darkMode={darkMode}
                />
              ))}

              {isTyping && <TypingIndicator />}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-white/10">
              <ChatInput
                onSend={sendMessage}
                darkMode={darkMode}
                model={model}
                setModel={setModel}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
