export const DEFAULT_PLAYER_NAME = "Anonymous";
export const MAX_PLAYER_NAME_LENGTH = 20;

/** Trim, cap at 20 chars, and fall back to "Anonymous" when empty. */
export function sanitizePlayerName(raw: string): string {
  const name = raw.trim().slice(0, MAX_PLAYER_NAME_LENGTH).trim();
  return name === "" ? DEFAULT_PLAYER_NAME : name;
}
