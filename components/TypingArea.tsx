import React, { RefObject } from "react";
import { EngineState, isWordWrong } from "../utils/typingEngine";
import FocusOverlay from "./FocusOverlay";
import TypingAreaSkeleton from "./TypingAreaSkeleton";
import Word from "./Word";

interface TypingAreaProps {
  state: EngineState;
  activeLetterIndex: number;
  isFocused: boolean;
  isIdle: boolean;
  caretRef: RefObject<HTMLDivElement | null>;
  targetRef: RefObject<HTMLSpanElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  /** The hidden text input; rendered inside the area so mobile keyboards open over the text. */
  children?: React.ReactNode;
}

const TypingArea = ({ state, activeLetterIndex, isFocused, isIdle, caretRef, targetRef, containerRef, viewportRef, onClick, onMouseDown, children }: TypingAreaProps) => (
  <div
    className="relative w-full cursor-text overflow-hidden p-1"
    onClick={onClick}
    onMouseDown={onMouseDown}
  >
    {children}
    {!isFocused && <FocusOverlay />}

    {state.words.length === 0 && <TypingAreaSkeleton />}

    <div ref={viewportRef} aria-hidden="true" className="relative overflow-hidden border-l-2 border-transparent">
      <div ref={containerRef} className="relative flex flex-wrap gap-x-[0.4em] gap-y-2 motion-safe:transition-transform motion-safe:duration-150 font-mono text-2xl sm:text-3xl font-medium tracking-wide leading-relaxed select-none">
        {isFocused && state.words.length > 0 && (
          <div
            ref={caretRef}
            className={`absolute bg-[#FFD523] w-[2.5px] rounded-full z-10${isIdle ? " motion-safe:animate-flash" : ""}`}
            style={{ height: "1.35em" }}
          />
        )}

        {state.words.map((word, wi) => {
          const isActive = wi === state.activeWordIndex;
          return (
            <Word
              key={wi}
              word={word}
              typed={state.typed[wi] ?? ""}
              isActive={isActive}
              isWrong={isWordWrong(state, wi)}
              activeLetterIndex={isActive ? activeLetterIndex : -1}
              caretRef={isActive ? targetRef : undefined}
            />
          );
        })}
      </div>
    </div>
  </div>
);

export default TypingArea;
