type Props = {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
};

export default function ChatHeader({ darkMode, setDarkMode }: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-4 
      bg-gradient-to-r from-blue-600 to-purple-600 
      dark:from-[#1E293B] dark:to-[#020617] text-white shadow-md">

      <div className="flex items-center gap-3">
        <img
          src="/astra-avatar.png"
          className="w-9 h-9 rounded-full"
          alt="Astra"
        />
        <h1 className="text-lg font-semibold">Astra AI</h1>
      </div>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition"
      >
        {darkMode ? "Light" : "Dark"}
      </button>
    </div>
  );
}