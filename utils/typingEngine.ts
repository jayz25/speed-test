export type TestStatus = "idle" | "running" | "finished";
export type LetterState = "idle" | "correct" | "incorrect" | "extra";

/** Max characters that can be typed beyond the end of a word. */
export const MAX_EXTRA_CHARS = 10;

export interface EngineState {
  words: readonly string[];
  /** typed[i] = chars typed for word i; length = activeWordIndex + 1 */
  typed: readonly string[];
  activeWordIndex: number;
  status: TestStatus;
  /** printable keys that matched the target letter */
  correctKeystrokes: number;
  incorrectKeystrokes: number;
}

export type EngineAction =
  | { type: "reset"; words: readonly string[] }
  | { type: "typeChar"; char: string } // single printable char, not space
  | { type: "backspace" }
  | { type: "submitWord" } // space
  | { type: "finish" };

export function createEngineState(words: readonly string[]): EngineState {
  return {
    words,
    typed: [""],
    activeWordIndex: 0,
    status: "idle",
    correctKeystrokes: 0,
    incorrectKeystrokes: 0,
  };
}

function withActiveTyped(state: EngineState, value: string): readonly string[] {
  return state.typed.map((t, i) => (i === state.activeWordIndex ? value : t));
}

export function engineReducer(state: EngineState, action: EngineAction): EngineState {
  switch (action.type) {
    case "reset":
      return createEngineState(action.words);

    case "typeChar": {
      if (state.status === "finished" || state.words.length === 0) return state;
      const active = state.typed[state.activeWordIndex] ?? "";
      const target = state.words[state.activeWordIndex] ?? "";
      if (active.length >= target.length + MAX_EXTRA_CHARS) return state;
      const isCorrect = action.char === target[active.length];
      return {
        ...state,
        typed: withActiveTyped(state, active + action.char),
        status: "running",
        correctKeystrokes: state.correctKeystrokes + (isCorrect ? 1 : 0),
        incorrectKeystrokes: state.incorrectKeystrokes + (isCorrect ? 0 : 1),
      };
    }

    case "backspace": {
      if (state.status === "finished" || state.words.length === 0) return state;
      const active = state.typed[state.activeWordIndex] ?? "";
      if (active.length === 0) return state;
      return { ...state, typed: withActiveTyped(state, active.slice(0, -1)) };
    }

    case "submitWord": {
      if (state.status === "finished" || state.words.length === 0) return state;
      const active = state.typed[state.activeWordIndex] ?? "";
      if (active.length === 0) return state;
      return {
        ...state,
        typed: [...state.typed, ""],
        activeWordIndex: state.activeWordIndex + 1,
      };
    }

    case "finish":
      return state.status === "running" ? { ...state, status: "finished" } : state;
  }
}

export function getLetterStates(target: string, typed: string): LetterState[] {
  const length = Math.max(target.length, typed.length);
  return Array.from({ length }, (_, i) => {
    if (i >= target.length) return "extra";
    if (i >= typed.length) return "idle";
    return typed[i] === target[i] ? "correct" : "incorrect";
  });
}

/** True when the word at `index` was submitted and does not match its target. */
export function isWordWrong(state: EngineState, index: number): boolean {
  if (index >= state.activeWordIndex) return false;
  return state.typed[index] !== state.words[index];
}

export function getWordCounts(state: EngineState): {
  wordsMatched: number;
  wordsIncorrect: number;
  charsMatched: number;
} {
  let wordsMatched = 0;
  let wordsIncorrect = 0;
  let charsMatched = 0;
  for (let i = 0; i < state.activeWordIndex; i++) {
    const target = state.words[i] ?? "";
    if (state.typed[i] === target) {
      wordsMatched += 1;
      charsMatched += target.length;
    } else {
      wordsIncorrect += 1;
    }
  }
  return { wordsMatched, wordsIncorrect, charsMatched };
}
