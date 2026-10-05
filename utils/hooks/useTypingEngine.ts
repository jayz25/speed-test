import { useCallback, useEffect, useReducer } from "react";
import { createEngineState, engineReducer } from "../typingEngine";

interface UseTypingEngineOptions {
  /** Words mode: finish when the last word is completed. */
  finishOnLastWord?: boolean;
  /** Bumping this restarts the test even when `words` is the same array (Repeat). */
  round?: number;
}

export function useTypingEngine(
  words: readonly string[],
  { finishOnLastWord = false, round = 0 }: UseTypingEngineOptions = {},
) {
  const [state, dispatch] = useReducer(engineReducer, undefined, () => createEngineState(words, finishOnLastWord));

  useEffect(() => {
    dispatch({ type: "reset", words, finishOnLastWord });
  }, [words, finishOnLastWord, round]);

  const typeChar = useCallback((char: string) => dispatch({ type: "typeChar", char }), []);
  const backspace = useCallback(() => dispatch({ type: "backspace" }), []);
  const submitWord = useCallback(() => dispatch({ type: "submitWord" }), []);
  const finish = useCallback(() => dispatch({ type: "finish" }), []);

  const activeLetterIndex = state.typed[state.activeWordIndex]?.length ?? 0;

  return { state, typeChar, backspace, submitWord, finish, activeLetterIndex };
}
