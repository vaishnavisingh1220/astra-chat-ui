import { MessageType } from "./ChatWindow";

export default function Message({ msg }: { msg: MessageType }) {
  const isUser = msg.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex items-end gap-2 max-w-xs md:max-w-md">

        {!isUser && (
          <img
            src="/astra-avatar.png"
            className="w-8 h-8 rounded-full"
            alt="Astra"
          />
        )}

        <div
          className={`px-4 py-2 text-sm rounded-2xl shadow
          ${isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white dark:bg-[#1F2937] text-gray-800 dark:text-gray-200 border dark:border-gray-700 rounded-bl-none"
          }`}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}