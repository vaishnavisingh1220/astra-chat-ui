export default function TypingIndicator() {
  return (
    <div className="flex gap-2 items-center">
      <img src="/astra-avatar.png" className="w-8 h-8 rounded-full" />

      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
      </div>
    </div>
  );
}