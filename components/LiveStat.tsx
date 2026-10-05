interface LiveStatProps {
  label: string;
  value: number;
  unit?: string;
}

const LiveStat = ({ label, value, unit = "" }: LiveStatProps) => (
  <div className="flex flex-col items-start leading-none opacity-90">
    <span className="text-3xl font-semibold tabular-nums text-white/90">{value}{unit}</span>
    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mt-1.5">{label}</span>
  </div>
);

export default LiveStat;
