import React, { RefObject } from "react";
import { EngineState, isWordWrong } from "../utils/typingEngine";
import FocusOverlay from "./FocusOverlay";
import Word from "./Word";

interface TypingAreaProps {
  state: EngineState;
  activeLetterIndex: number;
  isFocused: boolean;
  cursorRef: RefObject<HTMLDivElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

const TypingArea = ({ state, activeLetterIndex, isFocused, cursorRef, scrollRef, onClick, onMouseDown }: TypingAreaProps) => (
  <div
    className="relative w-full cursor-text overflow-hidden p-1"
    onClick={onClick}
    onMouseDown={onMouseDown}
    role="button"
    tabIndex={-1}
    aria-label="Typing area"
  >
    {!isFocused && <FocusOverlay />}

    <div ref={scrollRef} className="relative overflow-hidden h-40 border-l-2 border-transparent">
      <div className="relative flex flex-wrap gap-x-[0.4em] gap-y-2 text-3xl font-medium tracking-wide leading-relaxed select-none">
        {isFocused && state.words.length > 0 && (
          <div
            ref={cursorRef}
            className="absolute bg-[#FFD523] w-[2.5px] rounded-full z-10"
            style={{ height: "1.35em" }}
          />
        )}

        {state.words.map((word, wi) => (
          <Word
            key={wi}
            word={word}
            typed={state.typed[wi] ?? ""}
            isActive={wi === state.activeWordIndex}
            isWrong={isWordWrong(state, wi)}
            activeLetterIndex={activeLetterIndex}
          />
        ))}
      </div>
    </div>
  </div>
);

export default TypingArea;
