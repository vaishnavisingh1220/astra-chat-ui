type Props = {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onClear: () => void;
  onNewChat: () => void;
  chats: any[];
  setMessages: any;
  setChatId: (id: string | null) => void;
  currentChatId: string | null;
  setChats: React.Dispatch<React.SetStateAction<any[]>>;
};

import { signOut } from "next-auth/react";
import { use, useState } from "react";

export default function Sidebar({
  darkMode,
  setDarkMode,
  onClear,
  onNewChat,
  chats,
  setMessages,
  setChatId,
  currentChatId,
  setChats,
}: Props) {

  const [collapsed, setCollapsed] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
const [editingChatId, setEditingChatId] = useState<string | null>(null);
const [newTitle, setNewTitle] = useState("");

  const handleDeleteChat = async (id: string) => {
  try {
    console.log("Deleting chat:", id); // 🔍 debug

    const res = await fetch(`/api/chats/${id}`, {
      method: "DELETE",
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      console.warn("No JSON response");
    }

    if (!res.ok) {
      console.error("❌ Delete failed");
      console.error("Status:", res.status);
      console.error("Response:", data);
      return;
    }

    console.log("✅ Deleted successfully");

    // ✅ Update UI
    setChats((prev: any[]) => prev.filter((c: any) => c._id !== id));

    // ✅ Reset current chat ONLY if it's the one deleted
    setChatId((prev: string | null) => (prev === id ? null : prev));

    setMessages((prev: any[]) =>
      prev.length && id === prev[0]?.chatId ? [] : prev
    );

  } catch (err) {
    console.error("🚨 Delete request crashed:", err);
  }
};

// rename chat
const handleRename = async (id: string) => {
  if (!newTitle.trim()) return;

  try {
    await fetch(`/api/chats/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    setChats((prev: any[]) =>
      prev.map((c) =>
        c._id === id ? { ...c, title: newTitle } : c
      )
    );

    setEditingChatId(null);
    setNewTitle("");
  } catch (err) {
    console.error(err);
  }
};

// clear chat
const handleClearChat = async (id: string) => {
  try {
    await fetch(`/api/chats/${id}`, {
      method: "PUT",
    });

    setChats((prev: any[]) => prev.map((c) => c._id === id ? { ...c, messages: [] } : c
      )
    );

    setMessages([]);
    setChatId(id);
    setOpenMenuId(null);
  } catch (err) {
    console.error(err);
  }
};

  return (
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

      {/* ➕ NEW CHAT */}
      <div className="p-4">
      <button
  onClick={onNewChat}
  className="w-full p-2 rounded-lg
  bg-gradient-to-r from-blue-500 to-indigo-500
  text-sm font-medium shadow-md
  hover:scale-[1.02] transition"
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

        {/* 📚 HISTORY */}
        <div>
          <p className="text-xs text-gray-400 mb-2 px-2">History</p>

          <div className="space-y-1">
            {chats.length === 0 ? (
              <p className="text-xs text-gray-500 px-2">
                No chats yet
              </p>
            ) : (
              chats.map((chat) => (
                <div
  key={chat._id}
  className="relative flex items-center justify-between group px-2 py-1 rounded-lg transition hover:bg-white/10"
>
  {/* CHAT TITLE / EDIT MODE */}
  {editingChatId === chat._id ? (
    <input
      value={newTitle}
      onChange={(e) => setNewTitle(e.target.value)}
      onBlur={() => handleRename(chat._id)}
      onKeyDown={(e) => e.key === "Enter" && handleRename(chat._id)}
      className="flex-1 px-2 py-1 text-sm rounded bg-black/40 outline-none"
      autoFocus
    />
  ) : (
    <button
      onClick={() => {
        setMessages(chat.messages);
        setChatId(chat._id);
      }}
      className="flex-1 text-left px-2 py-1 text-sm truncate"
    >
      {chat.title || "Untitled Chat"}
    </button>
  )}

  {/* ⋯ MENU BUTTON */}
  <button
    onClick={() =>
      setOpenMenuId(openMenuId === chat._id ? null : chat._id)
    }
    className="opacity-0 group-hover:opacity-100 transition px-2"
  >
    ⋯
  </button>

  {/* DROPDOWN MENU */}
  {openMenuId === chat._id && (
    <div className="absolute right-0 top-8 w-36 bg-[#020617] border border-white/10 rounded-lg shadow-lg z-50">
      
      <button
        onClick={() => {
          setEditingChatId(chat._id);
          setNewTitle(chat.title || "");
          setOpenMenuId(null);
        }}
        className="w-full text-left px-3 py-2 text-sm hover:bg-white/10"
      >
        ✏️ Rename
      </button>

      <button
        onClick={() => handleClearChat(chat._id)}
        className="w-full text-left px-3 py-2 text-sm hover:bg-white/10"
      >
        🧹 Clear
      </button>

      <button
        onClick={() => handleDeleteChat(chat._id)}
        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10"
      >
        🗑 Delete
      </button>
    </div>
  )}
</div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 🔻 PROFILE SECTION */}
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
    {/* 🔥 LOGOUT BUTTON */}
  {!collapsed && (
    <button
      onClick={() => {
  console.log("logout");
}}
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
  );
}