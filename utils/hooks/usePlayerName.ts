import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSetting } from "../../redux/settings";
import type { AppDispatch, RootState } from "../../types/types";

/** Player name from the settings slice (persisted with the rest of the settings). */
export function usePlayerName() {
  const playerName = useSelector((state: RootState) => state.settings.playerName);
  const dispatch = useDispatch<AppDispatch>();
  const setPlayerName = useCallback((name: string) => dispatch(setSetting({ playerName: name })), [dispatch]);
  return [playerName, setPlayerName] as const;
}
