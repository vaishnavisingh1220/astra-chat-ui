"use client";


import API_BASE from "@/lib/api";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";


type Thread = {
  _id: string;
  title?: string;
  userId?: string;
  createdAt?: string;
};

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  darkMode: boolean;
  onClear: () => void;
  onNewChat: () => void;

  threads: Thread[];
  activeThreadId: string | null;
  onThreadClick: (id: string) => void;
};

export default function Sidebar({
  collapsed,
  setCollapsed,
  darkMode,
  onClear,
  onNewChat,
  threads,
  activeThreadId,
  onThreadClick,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();
  
  // 🗑 DELETE THREAD
// 🗑 DELETE THREAD
const handleDeleteThread = async (id: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/api/chat/threads/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("DELETE RESPONSE:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete thread");
    }

    router.refresh();

  } catch (err) {
    console.error("DELETE THREAD ERROR:", err);
  }
};

  // ✏️ RENAME THREAD
const handleRename = async (id: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/api/chat/threads/${id}/rename`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to rename thread");
    }

    setEditingId(null);
    setNewTitle("");
    router.refresh();
  } catch (err) {
    console.error("RENAME THREAD ERROR:", err);
  }
};

  const filteredThreads = threads.filter((t) =>
  (t.title || "").toLowerCase().includes(search.toLowerCase())
);

  return (
   /* <div
      className={`h-full ${
        collapsed ? "w-16" : "w-64"
      } transition-all duration-300 flex flex-col ${
        darkMode
          ? "bg-[#020617] border-r border-white/10"
          : "bg-white border-r border-gray-200"
      }`}
    >
    
      <div className="p-4 flex items-center justify-between">
        {!collapsed && <h1 className="font-semibold text-lg">Astra</h1>}
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div> 
      */
     <div
  className={`h-screen flex flex-col justify-between border-r transition-all duration-300
  ${collapsed ? "w-[70px]" : "w-64"}
  ${
    darkMode
      ? "bg-[#111827] text-[#F3F4F6] border-[#2B3548]"
      : "bg-[#F7F9FC] text-[#111827] border-[#E5E7EB]"
  }`}
>
  {/* 🔝 HEADER */}
  <div
    className={`p-4 border-b flex items-center justify-between
    ${
      darkMode
        ? "border-[#2B3548]"
        : "border-[#E5E7EB]"
    }`}
  >
    {!collapsed && (
      <h1
        className={`text-lg font-semibold tracking-wide ${
          darkMode ? "text-[#F3F4F6]" : "text-[#111827]"
        }`}
      >
        Astra AI ✨
      </h1>
    )}

    <button
      onClick={() => setCollapsed(!collapsed)}
      className={`transition ${
        darkMode
          ? "text-[#9CA3AF] hover:text-white"
          : "text-[#6B7280] hover:text-[#111827]"
      }`}
    >
      ☰
    </button>
  </div>

  {/* NEW CHAT */}
  <div className="p-4">
    <button
      onClick={onNewChat}
      className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95
      ${
        darkMode
          ? "bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white hover:opacity-95 shadow-[0_0_20px_rgba(124,92,255,0.18)]"
          : "bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white hover:opacity-95 shadow-sm"
      }`}
    >
      {collapsed ? "+" : "+ New Chat"}
    </button>
  </div>

  {/* 📜 SCROLL AREA */}
  <div className="flex-1 overflow-y-auto px-3 space-y-6 custom-scroll">

    {/* 🚀 SECTIONS */}
    <div>
      <p
        className={`text-xs mb-2 px-2 ${
          darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
        }`}
      >
        🚀 Coding
      </p>

      <button
        className={`w-full text-left px-3 py-2 rounded-xl transition duration-200
        ${
          darkMode
            ? "hover:bg-[#1A2236]"
            : "hover:bg-[#EEF2FF]"
        }`}
      >
        Code Assistant
      </button>
    </div>

    <div>
      <p
        className={`text-xs mb-2 px-2 ${
          darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
        }`}
      >
        🔍 Research
      </p>

      <button
        className={`w-full text-left px-3 py-2 rounded-xl transition duration-200
        ${
          darkMode
            ? "hover:bg-[#1A2236]"
            : "hover:bg-[#EEF2FF]"
        }`}
      >
        Web Search
      </button>
    </div>

    <div>
      <p
        className={`text-xs mb-2 px-2 ${
          darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
        }`}
      >
        💬 General
      </p>

      <button
        className={`w-full text-left px-3 py-2 rounded-xl transition duration-200
        ${
          darkMode
            ? "hover:bg-[#1A2236]"
            : "hover:bg-[#EEF2FF]"
        }`}
      >
        Chat Mode
      </button>
    </div>

    {/* SEARCH */}
    <input
      type="text"
      placeholder="Search chats..."
      value={search}
      onChange={(e) => {
        console.log("SEARCH:", e.target.value);
        setSearch(e.target.value);
      }}
      className={`w-full p-2.5 rounded-xl border outline-none transition
      ${
        darkMode
          ? "bg-[#0B1020] border-[#2B3548] text-white placeholder:text-[#6B7280] focus:border-[#7C5CFF]"
          : "bg-white border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#6D5EF5]"
      }`}
    />

    {/* THREAD LIST */}
    <div className="flex-1 overflow-y-auto mt-4 px-2 space-y-1">
      {filteredThreads.map((thread) => (
        <div
          key={thread._id}
          onClick={() => onThreadClick(thread._id)}
          className={`relative flex items-center justify-between group px-3 py-2 rounded-xl border transition-all duration-200
          ${
            activeThreadId === thread._id
              ? darkMode
                ? "bg-[#7C5CFF]/15 border-[#7C5CFF]/20"
                : "bg-[#6D5EF5]/10 border-[#6D5EF5]/20"
              : darkMode
              ? "border-transparent hover:bg-[#1A2236]"
              : "border-transparent hover:bg-[#EEF2FF]"
          }`}
        >
          {!collapsed && (
            <>
              {editingId === thread._id ? (
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={() => handleRename(thread._id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleRename(thread._id)
                  }
                  className={`bg-transparent outline-none text-sm w-full ${
                    darkMode ? "text-white" : "text-[#111827]"
                  }`}
                  autoFocus
                />
              ) : (
                <span
                  className={`truncate text-sm ${
                    darkMode ? "text-[#E5E7EB]" : "text-[#111827]"
                  }`}
                >
                  {thread?.title || "New Chat"}
                </span>
              )}
            </>
          )}

          {!collapsed && (
            <div className="opacity-0 group-hover:opacity-100 flex gap-2 text-xs">
              {/* Rename */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(thread._id);
                  setNewTitle(thread.title || "");
                }}
                className={`transition ${
                  darkMode
                    ? "text-[#9CA3AF] hover:text-[#F3F4F6]"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                ✎
              </button>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteThread(thread._id);
                }}
                className={`transition ${
                  darkMode
                    ? "text-[#9CA3AF] hover:text-[#F3F4F6]"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* BOTTOM */}
<div
  className={`p-3 border-t ${
    darkMode
      ? "border-[#2B3548] bg-[#111827]"
      : "border-[#E5E7EB] bg-[#F7F9FC]"
  }`}
>
  {/* PROFILE CARD */}
  <div
    className={`flex items-center gap-3 cursor-pointer p-3 rounded-2xl transition-all duration-200 border
    ${
      darkMode
        ? "bg-[#1A2236] border-[#2B3548] hover:bg-[#202A40]"
        : "bg-white border-[#E5E7EB] hover:bg-[#F3F4F6]"
    }`}
  >
    {/* Avatar */}
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#5B8CFF] flex items-center justify-center text-sm font-semibold text-white shadow-md">
      VS
    </div>

    {/* Name + Plan */}
    {!collapsed && (
      <div className="flex flex-col overflow-hidden">
        <span
          className={`text-sm font-medium truncate ${
            darkMode ? "text-[#F3F4F6]" : "text-[#111827]"
          }`}
        >
          Vaishnavi Singh
        </span>

        <span
          className={`text-xs ${
            darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
          }`}
        >
          Free Plan
        </span>
      </div>
    )}
  </div>

  {/* ACTION BUTTONS */}
  <div className="mt-3 space-y-2">
    
    {/* CLEAR */}
    {!collapsed && (
      <button
        onClick={() => {
          onClear();
          window.location.reload();
        }}
        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${
          darkMode
            ? "bg-[#1A2236] border border-[#2B3548] text-[#F3F4F6] hover:bg-[#202A40]"
            : "bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6]"
        }`}
      >
        Clear All
      </button>
    )}

    {/* LOGOUT */}
    {!collapsed && (
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm
        ${
          darkMode
            ? "bg-gradient-to-r from-[#7C5CFF] to-[#5B8CFF] text-white hover:opacity-95 shadow-[0_0_20px_rgba(124,92,255,0.18)]"
            : "bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white hover:opacity-95"
        }`}
      >
        Logout
      </button>
    )}
  </div>
</div>
</div>
</div>
  );
}