import { DEFAULT_PLAYER_NAME, MAX_PLAYER_NAME_LENGTH } from "../utils/playerName";

interface PlayerNameInputProps {
  value: string;
  onChange: (name: string) => void;
}

export default function PlayerNameInput({ value, onChange }: PlayerNameInputProps) {
  return (
    <label className="flex flex-col gap-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
      Name
      <input
        type="text"
        value={value}
        maxLength={MAX_PLAYER_NAME_LENGTH}
        placeholder={DEFAULT_PLAYER_NAME}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] w-full rounded-[10px] border border-border bg-surface px-3 text-[15px] font-normal normal-case tracking-normal text-ink placeholder:text-pending focus:border-accent focus:outline-none"
      />
    </label>
  );
}
