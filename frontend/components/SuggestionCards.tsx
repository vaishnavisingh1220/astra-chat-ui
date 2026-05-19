export default function SuggestionCards({ onSelect }: { onSelect: (value: string) => void }) {
  const suggestions = [
    "Explain AI simply",
    "Latest tech news",
    "Write Python code",
    "Research climate change",
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-1">

      <h1 className="text-3xl font-semibold mb-6">Astra AI ✨</h1>

      <div className="grid grid-cols-2 gap-4 max-w-xl">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow hover:scale-105 transition"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}