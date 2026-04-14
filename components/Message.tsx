import ReactMarkdown from "react-markdown";
import { MessageType } from "./ChatWindow";

export default function Message({ msg }: { msg: MessageType }) {
  const isUser = msg.sender === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}>
      <div className="flex flex-col max-w-xs md:max-w-md">

        <div className="flex items-end gap-2">
          {!isUser && (
            <img src="/astra-avatar.png" className="w-8 h-8 rounded-full" />
          )}

          <div className="relative group">
            <div
              className={`px-4 py-2 text-sm rounded-2xl shadow-md
              ${isUser
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "bg-white/80 dark:bg-white/10 text-gray-800 dark:text-gray-200"
              }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>

            <button
              onClick={handleCopy}
              className="absolute -top-2 -right-2 text-xs px-2 py-1 rounded 
              bg-black/70 text-white opacity-0 group-hover:opacity-100 transition"
            >
              Copy
            </button>
          </div>
        </div>

        <span className={`text-xs mt-1 ${isUser ? "text-right" : "text-left"} text-gray-400`}>
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>

      </div>
    </div>
  );
}