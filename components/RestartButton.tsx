interface RestartButtonProps {
  onClick: () => void;
}

const RestartButton = ({ onClick }: RestartButtonProps) => (
  <button
    id="reset-btn"
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    className="flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD523]"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    Restart Test
  </button>
);

export default RestartButton;
