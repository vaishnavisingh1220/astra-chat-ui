type Props = {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onClear: () => void;
  onNewChat: () => void;
  chats: any[];
  setMessages: any;
  setChatId: (id: string | null) => void;
};

export default function Sidebar({
  onNewChat,
  chats,
  setMessages,
  setChatId,
}: Props) {

  // 🗑 DELETE CHAT
  const handleDeleteChat = async (id: string) => {
  try {
    const res = await fetch(`/api/chats/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      return;
    }

    // ✅ Remove from UI instantly
    setChatId(null);
    setMessages([]);

    // ✅ Remove from sidebar without reload
    window.dispatchEvent(new Event("chat-deleted"));

  } catch (err) {
    console.error("Delete failed", err);
  }
};

  return (
    <div className="w-64 h-screen flex flex-col
    bg-gradient-to-b from-[#020617] via-[#020617] to-[#0F172A]
    border-r border-white/10 text-white">

      {/* 🔝 HEADER */}
      <div className="p-4 border-b border-white/10">
        <h1 className="text-lg font-semibold tracking-wide">
          Astra AI ✨
        </h1>
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
          + New Chat
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
                  className="flex items-center justify-between group
                  px-2 py-1 rounded-lg hover:bg-white/10 transition"
                >
                  {/* CHAT TITLE */}
                  <button
                    onClick={() => {
                      setMessages(chat.messages);
                      setChatId(chat._id);
                    }}
                    className="flex-1 text-left px-2 py-1 text-sm truncate"
                  >
                    {chat.title || "Untitled Chat"}
                  </button>

                  {/* 🗑 DELETE (HOVER ONLY) */}
                  <button
                    onClick={() => handleDeleteChat(chat._id)}
                    className="opacity-0 group-hover:opacity-100
                    text-red-400 hover:text-red-300
                    transition text-xs px-2"
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 🔻 FOOTER (MINIMAL) */}
      <div className="p-4 border-t border-white/10 text-xs text-gray-500">
        Astra v1
      </div>

    </div>
  );
}