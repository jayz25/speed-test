interface TimerOptionsProps {
  value: number;
  options: readonly number[];
  onChange: (seconds: number) => void;
}

const TimerOptions = ({ value, options, onChange }: TimerOptionsProps) => (
  <div className="flex bg-white/5 rounded-lg p-1 text-sm font-medium border border-white/5">
    {options.map((t) => (
      <button
        key={t}
        type="button"
        data-timer-btn="true"
        aria-pressed={value === t}
        onClick={() => onChange(t)}
        className={`px-3 py-1 rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD523] ${
          value === t ? "bg-[#FFD523] text-black" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
        }`}
      >
        {t}s
      </button>
    ))}
  </div>
);

export default TimerOptions;
