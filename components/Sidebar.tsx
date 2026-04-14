type Props = {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onClear: () => void;
  onNewChat: () => void;
  chats: any[];
  setMessages: (msgs: any[]) => void;
  setActiveChatId: (id: number) => void;
};

export default function Sidebar({
  darkMode,
  setDarkMode,
  onClear,
  onNewChat,
  chats,
  setMessages,
  setActiveChatId,
}: Props) {
  return (
    <div
      className={`w-64 h-full flex flex-col justify-between p-4
      ${darkMode
        ? "bg-gradient-to-b from-[#020617] via-[#0F172A] to-[#1E1B4B]"
        : "bg-white"
      }`}
    >

      <div>
        <div className="flex items-center gap-2 mb-6">
          <img src="/astra-avatar.png" className="w-8 h-8 rounded-full" />
          <h2 className="text-gray-800 dark:text-white">Astra AI</h2>
        </div>

        <button onClick={onNewChat} className="w-full mb-2 p-2 bg-blue-500 text-white rounded">
          + New Chat
        </button>

        <button onClick={onClear} className="w-full p-2 bg-red-500 text-white rounded">
          Clear Chat
        </button>
      
        {/* Chat History */}
        <div className="mt-4 space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setActiveChatId(chat.id);
                setMessages(chat.messages);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition
bg-gray-100 text-gray-800 hover:bg-gray-200
dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20"
            >
              {chat.title}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-gray-700 text-white rounded">
        Dark mode: {darkMode ? "On" : "Off"}
      </button>
    </div>
  );
}