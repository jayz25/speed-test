"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../types/types";
import { loadWords, refreshWords } from "../redux/paragraph";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { calculateStats, TestStats } from "../utils/calculateStats";
import useTimer from "../utils/hooks/useTimer";
import { useCaret } from "../utils/hooks/useCaret";
import { useTypingEngine } from "../utils/hooks/useTypingEngine";
import CapsLockAlert from "./CapsLockAlert";
import LiveStat from "./LiveStat";
import RestartButton from "./RestartButton";
import ResultCard from "./ResultCard";
import TimerOptions from "./TimerOptions";
import TypingArea from "./TypingArea";

const TIME_OPTIONS = [15, 30, 45, 60] as const;

const TypingTest = () => {
  const words = useSelector((state: RootState) => state.paragraph.wordsCollection);
  const dispatch = useDispatch<AppDispatch>();

  const [timeLimit, setTimeLimit] = useState(60);

  // Load words on first mount
  useEffect(() => {
    dispatch(loadWords({ count: 300 }));
  }, [dispatch]);

  const { state, typeChar, backspace, submitWord, finish, activeLetterIndex } = useTypingEngine(words);
  const { activeWordIndex } = state;
  const isStarted = state.status === "running";
  const isFinished = state.status === "finished";

  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [finalStats, setFinalStats] = useState<Pick<TestStats, "wpm" | "cpm" | "accuracy">>({ wpm: 0, cpm: 0, accuracy: 100 });
  const caretRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const textInput = useRef<HTMLInputElement>(null);

  const { seconds, start, reset, elapsedMs } = useTimer(timeLimit);

  // Computed stats
  const { wpm, cpm, accuracy } = calculateStats(state, elapsedMs());

  // Game over when timer reaches 0
  useEffect(() => {
    if (seconds === 0 && isStarted) {
      finish();
      setFinalStats({ wpm, cpm, accuracy });
    }
  }, [seconds, isStarted, finish, wpm, cpm, accuracy]);

  useCaret({
    caretRef, targetRef, containerRef, viewportRef,
    deps: [activeWordIndex, activeLetterIndex, words, isFocused, isFinished],
  });

  // Reset view state whenever the word list changes (engine resets itself)
  useEffect(() => {
    if (words.length > 0) {
      textInput.current?.focus();
    }
  }, [words]);

  const resetTest = useCallback(() => {
    reset(timeLimit);
    dispatch(refreshWords());
  }, [reset, dispatch, timeLimit]);

  // Re-run timer reset if timeLimit UI button clicked
  const handleTimeChange = (newTime: number) => {
    setTimeLimit(newTime);
    reset(newTime);
    dispatch(refreshWords());
    textInput.current?.focus();
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState("CapsLock"));

    if (e.ctrlKey || e.altKey || e.metaKey || ["Tab", "CapsLock"].includes(e.key)) return;
    if (words.length === 0 || isFinished) return;

    if (e.key === "Backspace") {
      backspace();
      return;
    }

    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      submitWord();
      return;
    }

    // Regular printable character (length===1 guards modifiers)
    if (e.key.length !== 1) return;
    if (state.status === "idle") start();
    typeChar(e.key);
  }, [words, isFinished, state.status, start, typeChar, backspace, submitWord]);

  const handleSelect = useCallback((e: React.UIEvent<HTMLInputElement>) => {
    const el = e.target as HTMLInputElement;
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const relTarget = e.relatedTarget as HTMLElement | null;
    if (relTarget?.id === "reset-btn" || relTarget?.dataset.timerBtn) return; // don't blur when clicking reset
    setIsFocused(false);
  }, []);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    textInput.current?.focus();
    setIsFocused(true);
  }, []);

  const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  if (isFinished) {
    return (
      <ResultCard
        wpm={finalStats.wpm}
        cpm={finalStats.cpm}
        accuracy={finalStats.accuracy}
        onReset={resetTest}
      />
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl gap-6 relative">
      <input
        ref={textInput}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        id="typing-input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        value=""
        onKeyDown={handleKeyDown}
        onChange={() => {}}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onSelect={handleSelect}
        type="text"
        aria-label="Typing input"
      />

      <div className="flex items-center justify-between w-full h-8 px-1">
        <CapsLockAlert isVisible={isCapsLockOn} />
        {!isStarted && <div className="ml-auto flex items-center gap-4 text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg> <TimerOptions value={timeLimit} options={TIME_OPTIONS} onChange={handleTimeChange} /></div>}
      </div>

      <div className="flex w-full justify-between items-end px-1 mb-2">
        <div className="flex gap-8">
          <LiveStat label="WPM" value={isStarted ? wpm : 0} />
          <LiveStat label="CPM" value={isStarted ? cpm : 0} />
          <LiveStat label="ACC" value={accuracy} unit="%" />
        </div>
        <div className={`text-5xl font-mono tracking-tighter font-semibold transition-colors duration-300 opacity-90 ${seconds <= 5 ? "text-red-400" : "text-[#FFD523]"}`}>
          {seconds}
        </div>
      </div>

      <TypingArea
        state={state}
        activeLetterIndex={activeLetterIndex}
        isFocused={isFocused}
        isIdle={state.status === "idle"}
        caretRef={caretRef}
        targetRef={targetRef}
        containerRef={containerRef}
        viewportRef={viewportRef}
        onClick={handleContainerClick}
        onMouseDown={handleContainerMouseDown}
      />

      <RestartButton onClick={resetTest} />
    </div>
  );
};

export default TypingTest;
