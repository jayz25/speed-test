import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addStatCall, isStatsApiEnabled } from "../../redux/stat";
import { AppDispatch } from "../../types/types";

import { isPlausibleWpm } from "../calculateStats";

export { MAX_PLAUSIBLE_WPM } from "../calculateStats";

interface PostResultArgs {
  isFinished: boolean;
  /** Identifies the current test round; a new value means a new test. */
  roundId: number;
  wpm: number;
  cpm: number;
  accuracy: number;
  user: string;
}

/** Posts the result exactly once per round, on the transition to finished. */
export function usePostResultOnFinish({ isFinished, roundId, wpm, cpm, accuracy, user }: PostResultArgs) {
  const dispatch = useDispatch<AppDispatch>();
  const postedRound = useRef<number | null>(null);

  useEffect(() => {
    if (!isFinished || !isStatsApiEnabled) return;
    if (postedRound.current === roundId) return;
    postedRound.current = roundId;
    if (!isPlausibleWpm(wpm)) return;
    dispatch(addStatCall({ words: wpm, chars: cpm, accuracy, user }));
  }, [isFinished, roundId, wpm, cpm, accuracy, user, dispatch]);
}
