import { MessageType } from "./ChatWindow";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Message({ msg }: { msg: MessageType }) {
  const isUser = msg.sender === "user";

  return (
    <div className={`flex animate-fadeIn ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col max-w-xs md:max-w-md">

        {/* Bubbles */}
        <div className="flex items-end gap-2">
          {!isUser && (
            <img
              src="/astra-avatar.png"
              className="w-8 h-8 rounded-full"
              alt="Astra"
            />
          )}

          <div
            className={`px-4 py-2 text-sm rounded-2xl shadow-md backdrop-blur-md
            ${isUser
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none"
              : "bg-white/80 dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-white/20 rounded-bl-none"
            }`}
          >
            {msg.text}
          </div>
        </div>

        {/* Timestamp for message */}
        <span
          className={`text-xs mt-1 px-1 text-gray-500 dark:text-gray-400
          ${isUser ? "text-right" : "text-left"}`}
        >
          {formatTime(msg.createdAt || new Date(msg.id))}
        </span>
      </div>
    </div>
  );
}