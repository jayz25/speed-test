import React from "react";
import { getLetterStates, LetterState } from "../utils/typingEngine";

const LETTER_CLASSES: Record<LetterState, string> = {
  idle: "text-slate-600 opacity-70",
  correct: "text-slate-100",
  incorrect: "text-red-400",
  extra: "text-red-400/70",
};

interface WordProps {
  word: string;
  typed: string;
  isActive: boolean;
  isWrong: boolean;
  activeLetterIndex: number;
}

const Word = ({ word, typed, isActive, isWrong, activeLetterIndex }: WordProps) => {
  const states = getLetterStates(word, typed);
  const letters = states.map((_, i) => word[i] ?? typed[i]);
  return (
    <div
      className={`flex whitespace-pre ${isWrong ? "underline decoration-red-500/50 decoration-2 underline-offset-4" : ""}`}
      aria-label={word}
    >
      {letters.map((letter, li) => (
        <span
          key={li}
          id={isActive && li === activeLetterIndex ? "active-character" : undefined}
          className={`${LETTER_CLASSES[states[li]]} transition-colors duration-200`}
        >
          {letter}
        </span>
      ))}
      <span
        id={isActive && activeLetterIndex >= letters.length ? "active-character" : undefined}
        className="w-[0.4em]"
      />
    </div>
  );
};

export default React.memo(Word);
