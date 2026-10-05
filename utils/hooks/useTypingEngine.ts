import { useCallback, useEffect, useReducer } from "react";
import { createEngineState, engineReducer } from "../typingEngine";

export function useTypingEngine(words: readonly string[]) {
  const [state, dispatch] = useReducer(engineReducer, words, createEngineState);

  useEffect(() => {
    dispatch({ type: "reset", words });
  }, [words]);

  const typeChar = useCallback((char: string) => dispatch({ type: "typeChar", char }), []);
  const backspace = useCallback(() => dispatch({ type: "backspace" }), []);
  const submitWord = useCallback(() => dispatch({ type: "submitWord" }), []);
  const finish = useCallback(() => dispatch({ type: "finish" }), []);

  const activeLetterIndex = state.typed[state.activeWordIndex]?.length ?? 0;

  return { state, typeChar, backspace, submitWord, finish, activeLetterIndex };
}
