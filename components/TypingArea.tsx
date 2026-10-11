import React, { RefObject } from "react";
import { EngineState, isWordWrong } from "../utils/typingEngine";
import FocusOverlay from "./FocusOverlay";
import TypingAreaSkeleton from "./TypingAreaSkeleton";
import Word from "./Word";

/** Words rendered beyond the active one; the rest is never visible in the 216px box. */
const RENDER_AHEAD_WORDS = 60;

interface TypingAreaProps {
  state: EngineState;
  activeLetterIndex: number;
  isFocused: boolean;
  isIdle: boolean;
  /** The scrolling words box (scrolled by useCaret). */
  boxRef: RefObject<HTMLDivElement | null>;
  /** Attached to the letter carrying the caret. */
  targetRef: RefObject<HTMLSpanElement | null>;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  /** The hidden text input; rendered over the box so mobile keyboards open over the text. */
  children?: React.ReactNode;
}

const TypingArea = ({ state, activeLetterIndex, isFocused, isIdle, boxRef, targetRef, onClick, onMouseDown, children }: TypingAreaProps) => {
  const visibleWords = state.words.slice(0, state.activeWordIndex + RENDER_AHEAD_WORDS);
  const showFocusPrompt = !isFocused && isIdle && state.words.length > 0;

  return (
    <div className="relative cursor-text" onClick={onClick} onMouseDown={onMouseDown}>
      <div
        ref={boxRef}
        aria-hidden="true"
        className={`relative flex h-[216px] flex-wrap content-start gap-x-[18px] gap-y-[10px] overflow-hidden font-mono text-[30px] leading-[44px] select-none transition-[filter] ${showFocusPrompt ? "blur-[3px]" : ""}`}
      >
        {state.words.length === 0 && <TypingAreaSkeleton />}
        {visibleWords.map((word, wi) => {
          const isActive = wi === state.activeWordIndex;
          return (
            <Word
              key={wi}
              word={word}
              typed={state.typed[wi] ?? ""}
              isActive={isActive}
              isWrong={isWordWrong(state, wi)}
              activeLetterIndex={isActive ? activeLetterIndex : -1}
              showCaret={isFocused}
              caretRef={isActive ? targetRef : undefined}
            />
          );
        })}
      </div>
      {showFocusPrompt && <FocusOverlay />}
      {children}
    </div>
  );
};

export default TypingArea;
