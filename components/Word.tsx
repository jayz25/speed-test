import React from "react";
import { getLetterStates, LetterState } from "../utils/typingEngine";

const LETTER_CLASSES: Record<LetterState, string> = {
  idle: "text-slate-500",
  correct: "text-slate-100",
  incorrect: "text-red-400",
  extra: "text-red-400/70",
};

interface WordProps {
  word: string;
  typed: string;
  isActive: boolean;
  isWrong: boolean;
  /** Index of the caret within this word; -1 when the word is not active. */
  activeLetterIndex: number;
  /** Attached to the active letter (or trailing spacer); only passed to the active word. */
  caretRef?: React.Ref<HTMLSpanElement>;
}

const Word = ({ word, typed, isActive, isWrong, activeLetterIndex, caretRef }: WordProps) => {
  const states = getLetterStates(word, typed);
  const letters = states.map((_, i) => word[i] ?? typed[i]);
  return (
    <div
      className={`flex whitespace-pre ${isWrong ? "underline decoration-red-500/50 decoration-2 underline-offset-4" : ""}`}
      data-word
    >
      {letters.map((letter, li) => (
        <span
          key={li}
          ref={isActive && li === activeLetterIndex ? caretRef : undefined}
          className={`${LETTER_CLASSES[states[li]]}`}
        >
          {letter}
        </span>
      ))}
      <span
        ref={isActive && activeLetterIndex >= letters.length ? caretRef : undefined}
        className="w-[0.4em]"
      />
    </div>
  );
};

export default React.memo(Word);
