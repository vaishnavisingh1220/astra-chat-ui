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
  darkMode,
  setDarkMode,
  onClear,
  onNewChat,
  chats,
  setMessages,
  setChatId,
}: Props) {
  return (
    <div className="w-64 h-full flex flex-col justify-between p-4
    bg-white dark:bg-[#020617] border-r dark:border-gray-800">

      {/* TOP */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Astra Chats
        </h2>

        <button
          onClick={onNewChat}
          className="w-full mb-4 p-2 rounded-lg
          bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
        >
          + New Chat
        </button>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {chats.length === 0 ? (
            <p className="text-sm text-gray-400">No chats yet</p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => {
                  setMessages(chat.messages);
                  setChatId(chat._id);
                }}
                className="w-full text-left p-2 rounded-lg
                bg-gray-100 dark:bg-gray-800
                hover:bg-blue-100 dark:hover:bg-gray-700
                text-gray-800 dark:text-white text-sm"
              >
                {chat.title}
              </button>
            ))
          )}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="space-y-3">
        <button
          onClick={onClear}
          className="w-full p-2 rounded-lg
          bg-gradient-to-r from-red-500 to-pink-500 text-white"
        >
          Clear Chat
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full p-2 rounded-lg
          bg-gray-200 dark:bg-gray-700
          text-gray-800 dark:text-white"
        >
          Toggle Mode
        </button>
      </div>
    </div>
  );
}