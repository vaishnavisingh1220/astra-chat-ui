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
  const handleDeleteThread = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/chat/threads/${id}`, {
  method: "DELETE",
});
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // ✏️ RENAME THREAD
  const handleRename = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/chat/threads/${id}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });

      setEditingId(null);
      setNewTitle("");
      router.refresh();
    } catch (err) {
      console.error(err);
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
      ? "bg-gradient-to-b from-[#020617] via-[#020617] to-[#0F172A] text-white border-white/10"
      : "bg-white text-black border-gray-200"
  }`}
>
      {/* 🔝 HEADER */}
     <div className="p-4 border-b border-white/10 flex items-center justify-between">
  {!collapsed && (
    <h1 className="text-lg font-semibold tracking-wide">
      Astra AI ✨
    </h1>
  )}

  <button onClick={() => setCollapsed(!collapsed)}>
    ☰
  </button>
</div>


      {/* NEW CHAT */}
       <div className="p-4">
      <button
  onClick={onNewChat}
  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition active:scale-95
    ${
      darkMode
        ? "bg-gradient-to-r from-[#020617] to-purple-600 text-white hover:opacity-90"
        : "bg-gradient-to-r from-purple-100 to-purple-300 text-black hover:opacity-90 shadow-sm"
    }`}
>
  {collapsed ? "+" : "+ New Chat"}
</button>
      </div>

 {/* 📜 SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6 custom-scroll">

        {/* 🚀 SECTIONS */}
        <div>
          <p className="text-xs text-gray-400 mb-2 px-2">🚀 Coding</p>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition">
            Code Assistant
          </button>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2 px-2">🔍 Research</p>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition">
            Web Search
          </button>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2 px-2">💬 General</p>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition">
            Chat Mode
          </button>
        </div>
<input
  type="text"
  placeholder="Search chats..."
  value={search}
  onChange={(e) => {
    console.log("SEARCH:", e.target.value); // debug
    setSearch(e.target.value);
  }}
  className="w-full p-2 rounded bg-white/5 mb-2"
/>

      {/* THREAD LIST */}
      <div className="flex-1 overflow-y-auto mt-4 px-2 space-y-1">
        {filteredThreads.map((thread) => (
          <div
            key={thread._id}
            onClick={() => onThreadClick(thread._id)}
            className={`relative flex items-center justify-between group px-2 py-1 rounded-lg transition hover:bg-white/10${
              activeThreadId === thread._id
                ? "bg-blue-500/20"
                : "hover:bg-white/10"
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
                    className="bg-transparent outline-none text-sm w-full"
                    autoFocus
                  />
                ) : (
                  <span className="truncate text-sm">
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
                  className="text-yellow-400 hover:text-yellow-600"
                >
                  ✎
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteThread(thread._id);
                  }}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BOTTOM */}
      <div className="p-3 border-t border-white/10">
  <div className="flex items-center gap-3 cursor-pointer hover:bg-white/10 p-2 rounded-lg">
    
    {/* Avatar */}
    <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-sm font-semibold">
      VS
    </div>

    {/* Name + Plan */}
    {!collapsed && (
      <div className="flex flex-col">
        <span className="text-sm">Vaishnavi Singh</span>
        <span className="text-xs text-gray-400">Free</span>
      </div>
    )}
  </div>

  <div className="mt-3 space-y-2">
    {!collapsed && (
      <button
        onClick={() => { onClear(); window.location.reload(); }}
        className="w-full py-2 rounded-lg text-sm font-medium transition bg-red-600 text-white"
      >
        Clear All
      </button>
    )}

    {!collapsed && (
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className={`w-full py-2 rounded-lg text-sm font-medium transition
${
  darkMode
    ? "bg-gradient-to-r from-[#020617] to-purple-600 text-white hover:opacity-90"
    : "bg-gradient-to-r from-purple-100 to-purple-300 text-black hover:opacity-90"
}`}>
        Logout
      </button>
    )}
  </div>
</div>
</div>
      </div>
    
  );
}