import { useCallback, useEffect, useState } from "react";
import { isStoredSettings, StoredSettings } from "../playerName";
import { readJSON, SETTINGS_KEY, writeJSON } from "../storage";

const EMPTY_SETTINGS: StoredSettings = { playerName: "" };

/** Player name persisted under `speedtype:v1:settings` as `{ playerName }`. */
export function usePlayerName() {
  const [playerName, setPlayerNameState] = useState("");

  // Hydrate after mount so server and client markup match.
  useEffect(() => {
    setPlayerNameState(readJSON(SETTINGS_KEY, EMPTY_SETTINGS, isStoredSettings).playerName);
  }, []);

  const setPlayerName = useCallback((name: string) => {
    setPlayerNameState(name);
    writeJSON(SETTINGS_KEY, { playerName: name });
  }, []);

  return [playerName, setPlayerName] as const;
}
