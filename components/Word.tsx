import React from "react";
import { getLetterStates, LetterState } from "../utils/typingEngine";

const LETTER_CLASSES: Record<LetterState, string> = {
  idle: "text-pending",
  correct: "text-ink",
  incorrect: "text-error",
  extra: "text-error-extra",
};

interface WordProps {
  word: string;
  typed: string;
  isActive: boolean;
  isWrong: boolean;
  /** Index of the caret within this word; -1 when the word is not active. */
  activeLetterIndex: number;
  /** Draw the caret (only while the input is focused). */
  showCaret?: boolean;
  /** Attached to the letter carrying the caret; only passed to the active word. */
  caretRef?: React.Ref<HTMLSpanElement>;
}

const Word = ({ word, typed, isActive, isWrong, activeLetterIndex, showCaret = false, caretRef }: WordProps) => {
  const states = getLetterStates(word, typed);
  const letters = states.map((_, i) => word[i] ?? typed[i]);
  const lastIndex = letters.length - 1;
  // Fully/over-typed words carry the caret after their last letter
  const isCaretAfter = isActive && activeLetterIndex > lastIndex;
  const caretIndex = isActive ? Math.min(activeLetterIndex, lastIndex) : -1;

  return (
    <div
      className={`inline-flex whitespace-nowrap ${isWrong ? "underline decoration-error decoration-2 underline-offset-[9px]" : ""}`}
      data-word
    >
      {letters.map((letter, li) => {
        const isCaretLetter = li === caretIndex;
        let caretClass = "";
        if (showCaret && isCaretLetter) caretClass = isCaretAfter ? " shadow-caret-after" : " shadow-caret-before";
        return (
          <span
            key={li}
            ref={isCaretLetter ? caretRef : undefined}
            className={`${LETTER_CLASSES[states[li]]}${caretClass}`}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
};

export default React.memo(Word);
