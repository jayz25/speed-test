import { DEFAULT_PLAYER_NAME, MAX_PLAYER_NAME_LENGTH } from "../utils/playerName";

interface PlayerNameInputProps {
  value: string;
  onChange: (name: string) => void;
}

export default function PlayerNameInput({ value, onChange }: PlayerNameInputProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-500">
      Name
      <input
        type="text"
        value={value}
        maxLength={MAX_PLAYER_NAME_LENGTH}
        placeholder={DEFAULT_PLAYER_NAME}
        onChange={(e) => onChange(e.target.value)}
        className="w-36 rounded-md bg-white/5 border border-white/10 px-2 py-1 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#FFD523]"
      />
    </label>
  );
}
