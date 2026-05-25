"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Message from "./Message";
import ChatInput from "./ChatInput";
import Sidebar from "./Sidebar";
import TypingIndicator from "./TypingIndicator";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

import { uploadPDF } from "@/lib/ragApi";

import API_BASE from "@/lib/api";

type UploadedFile = {
  name: string;
  size: number;
  modifiedAt: string;
};

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

type AppSession = Session & {
  accessToken?: string;
};

export default function ChatWindow() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const token = (session as AppSession)?.accessToken;

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

  const [uploading, setUploading] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  const [threads, setThreads] = useState<ThreadType[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [model, setModel] = useState("auto");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  type CryptoWithRandomUUID = typeof crypto & {
    randomUUID?: () => string;
  };

  const generateId = () => {
    try {
      if (
        typeof crypto !== "undefined" &&
        typeof (crypto as CryptoWithRandomUUID).randomUUID === "function"
      ) {
        return (crypto as CryptoWithRandomUUID).randomUUID();
      }
    } catch {}

    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  };

  useEffect(() => {
    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  
  // =========================
  // LOAD THREADS
  // =========================

  const loadThreads = useCallback(async () => {
    try {
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

      setThreads(data.data || []);
    } catch (err) {
      console.error("Load threads error:", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadThreads();
    }
  }, [token, loadThreads]);

  // =========================
  // AUTH STATES
  // =========================

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        Loading...
      </div>
    );
  }

  if (!session || !token) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        Redirecting to login...
      </div>
    );
  }

  // =========================
  // CREATE THREAD
  // =========================

  const createThread = async (): Promise<string | null> => {
    try {
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

      const thread = data.data;

      if (!thread?._id) {
        return null;
      }

      setThreads((prev) => [thread, ...prev]);

      setActiveThreadId(thread._id);

      setMessages([]);

      return thread._id;
    } catch (err) {
      console.error(err);

      return null;
    }
  };

  // =========================
  // LOAD MESSAGES
  // =========================

  const loadThreadMessages = async (id: string) => {
    try {
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

      setMessages(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // SEND MESSAGE
  // =========================

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setIsTyping(true);

    let threadId = activeThreadId;

    try {
      if (!threadId) {
        threadId = await createThread();
      }

      if (!threadId) return;

      const userMessage = {
        _id: generateId(),
        role: "user" as const,
        content: text,
      };

      setMessages((prev) => [...prev, userMessage]);

      console.log("CURRENT selectedFiles:", selectedFiles);

      console.log("FINAL THREAD:", threadId);

console.log(
  "FINAL selectedFiles:",
  selectedFiles
);

      const res = await fetch(
        `${API_BASE}/api/chat/messages`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            threadId: threadId,
            text,
            useRag: selectedFiles.length > 0,
            pdfNames: selectedFiles,
          }),
        }
      );

      const data = await res.json();

      const finalReply =
        data?.data?.aiMessage?.content ||
        "⚠️ No response generated";

      setMessages((prev) => [
        ...prev,
        {
          _id: generateId(),
          role: "assistant",
          content: finalReply,
        },
      ]);

      loadThreads();
    } catch (err) {
      console.error(err);

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

  // =========================
  // PDF UPLOAD
  // =========================

  const handlePDFUpload = async (
  files: File[]
) => {
  try {
    setUploading(true);

    const uploadedNames: string[] = [];

    for (const file of files) {
      const data = await uploadPDF(file);

      uploadedNames.push(
        data.filename
      );
    }
      

    // ✅ Store uploaded PDF names
    setSelectedFiles(uploadedNames);

    console.log(
  "UPDATED selectedFiles:",
  uploadedNames
);

  } catch (error) {
    console.error(
      "Upload error:",
      error
    );

    alert("Upload failed");
  } finally {
    setUploading(false);
  }
};

  // =========================
  // CLEAR CHAT
  // =========================

  const handleClear = async () => {
    setMessages([]);
  };

  return (
    <div
      className={`flex h-screen ${
        darkMode
          ? "bg-[#020617] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      {/* SIDEBAR */}

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
        <source
          src="/notification.mp3"
          type="audio/mpeg"
        />
      </audio>

      {/* MAIN */}

      <div className="flex flex-col flex-1">
        {/* TOP BAR */}

        <div className="w-full flex justify-between items-center p-4 border-b border-white/10">
          <h1 className="text-xl font-semibold">
            Astra AI ✨
          </h1>

          <div className="flex items-center gap-3">
            
          

            {/* Theme */}

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className="w-10 h-10 rounded-full bg-white/10"
            >
              {darkMode ? "🌙" : "☀️"}
            </button>
          </div>
        </div>

        {/* EMPTY */}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
            <Image
              src="/astra-avatar.png"
              alt="Astra"
              width={80}
              height={80}
              className="rounded-full mb-4"
            />

            <h1 className="text-3xl font-bold">
              Astra AI ✨
            </h1>

            <p className="text-gray-400 mt-2">
              Upload PDFs and ask questions
            </p>

            <div className="mt-6 w-full max-w-2xl">
              <ChatInput
                onSend={sendMessage}
                darkMode={darkMode}
                model={model}
                setModel={setModel}
                onFilesSelected={handlePDFUpload}
                attachedFiles={selectedFiles}
                setAttachedFiles={setSelectedFiles}
              />
            </div>

          </div>
        ) : (
          <>
            {/* MESSAGES */}

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
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
                attachedFiles={selectedFiles}
                setAttachedFiles={setSelectedFiles}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}