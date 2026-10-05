"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../types/types";
import { loadWords, refreshWords } from "../redux/paragraph";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateStats, TestStats } from "../utils/calculateStats";
import useTimer from "../utils/hooks/useTimer";
import { useFocusMode } from "../utils/hooks/useFocusMode";
import { useCaret } from "../utils/hooks/useCaret";
import { usePostResultOnFinish } from "../utils/hooks/usePostResultOnFinish";
import { usePlayerName } from "../utils/hooks/usePlayerName";
import { sanitizePlayerName } from "../utils/playerName";
import { useTypingEngine } from "../utils/hooks/useTypingEngine";
import ConfigBar from "./ConfigBar";
import CapsLockAlert from "./CapsLockAlert";
import LiveAnnouncer from "./LiveAnnouncer";
import LiveStat from "./LiveStat";
import RestartButton from "./RestartButton";
import ResultCard from "./ResultCard";
import TypingArea from "./TypingArea";

// Chrome that fades out in focus mode (see useFocusMode + globals.css)
const FADE_CLASSES = "transition-opacity duration-300";

const INITIAL_STATS: TestStats = {
  wpm: 0, rawWpm: 0, cpm: 0, accuracy: 100,
  correctChars: 0, incorrectChars: 0, extraChars: 0, missedChars: 0,
};
const WARNING_SECONDS = 10;
const MS_PER_SECOND = 1000;
/** Words generated for time mode; more than anyone can type in the longest limit. */
const TIME_MODE_WORDS = 300;

const TypingTest = () => {
  const words = useSelector((state: RootState) => state.paragraph.wordsCollection);
  const dispatch = useDispatch<AppDispatch>();

  const { mode, timeLimit, wordCount, difficulty, punctuation, numbers } = useSelector((state: RootState) => state.settings);

  // (Re)generate words whenever a setting changes (and on mount)
  useEffect(() => {
    dispatch(loadWords({ count: mode === "words" ? wordCount : TIME_MODE_WORDS, mode: difficulty, punctuation, numbers }));
  }, [dispatch, mode, wordCount, difficulty, punctuation, numbers, timeLimit]);

  const isWordsMode = mode === "words";
  const { state, typeChar, backspace, submitWord, finish, activeLetterIndex } = useTypingEngine(words, { finishOnLastWord: isWordsMode });
  const { activeWordIndex } = state;
  const isStarted = state.status === "running";
  const isFinished = state.status === "finished";

  useFocusMode(isStarted);

  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [finalStats, setFinalStats] = useState<TestStats>(INITIAL_STATS);
  const [finalElapsedMs, setFinalElapsedMs] = useState(0);
  const caretRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const textInput = useRef<HTMLInputElement>(null);
  const didKeyDownBackspace = useRef(false);

  const { seconds, start, stop: stopTimer, reset, elapsedMs } = useTimer(timeLimit, isWordsMode ? "up" : "down");

  // Computed stats
  // Live stats are recomputed once per timer tick (or new test), not per keystroke
  const liveStats = useMemo(
    () => calculateStats(state, elapsedMs()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seconds, state.words],
  );
  const { wpm, cpm, accuracy } = liveStats;

  // Time mode: game over when the countdown reaches 0 (words mode ends in the engine)
  useEffect(() => {
    if (!isWordsMode && seconds === 0 && isStarted) finish();
  }, [isWordsMode, seconds, isStarted, finish]);

  // Freeze the clock and the result once the engine reports finished (state is stable after that)
  useEffect(() => {
    if (!isFinished) return;
    stopTimer();
    const elapsed = elapsedMs();
    setFinalStats(calculateStats(state, elapsed));
    setFinalElapsedMs(elapsed);
  }, [isFinished, state, stopTimer, elapsedMs]);

  const [playerName] = usePlayerName();

  usePostResultOnFinish({
    isFinished, roundId: words, wpm: finalStats.wpm, cpm: finalStats.cpm, accuracy: finalStats.accuracy, user: sanitizePlayerName(playerName),
  });

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

  // The input is autoFocus'd; reflect whether it really has focus after mount
  useEffect(() => {
    setIsFocused(document.activeElement === textInput.current);
  }, []);

  // A settings change restarts the test (new words arrive via the effect above)
  useEffect(() => {
    reset(timeLimit);
  }, [reset, timeLimit, mode, wordCount, difficulty, punctuation, numbers]);

  const resetTest = useCallback(() => {
    reset(timeLimit);
    dispatch(refreshWords());
    textInput.current?.focus();
  }, [reset, dispatch, timeLimit]);

  // Esc anywhere restarts the test
  useEffect(() => {
    if (isFinished) return; // ResultCard handles Esc itself
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") resetTest();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFinished, resetTest]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState("CapsLock"));

    if (e.key === "Tab") {
      // Tab + Enter restarts instead of focusing the first duration button
      e.preventDefault();
      document.getElementById("reset-btn")?.focus();
      return;
    }
    if (e.ctrlKey || e.altKey || e.metaKey || e.key === "CapsLock") return;
    if (words.length === 0 || isFinished) return;

    if (e.key === "Unidentified" || e.nativeEvent.isComposing) return; // handled via the input event

    if (e.key === "Backspace") {
      didKeyDownBackspace.current = true;
      backspace();
      return;
    }

    // Space must not reach the input; printable characters are handled in handleInput
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      submitWord();
    }
  }, [words, isFinished, backspace, submitWord]);

  const handleKeyUp = useCallback(() => {
    didKeyDownBackspace.current = false;
  }, []);

  // Printable characters (and soft-keyboard backspace) arrive here so mobile keyboards,
  // which send key "Unidentified" on keydown, work as well as desktop ones.
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const { inputType, data } = e.nativeEvent as InputEvent;
    if (words.length === 0 || isFinished) return;

    if (inputType === "deleteContentBackward") {
      // Desktop already handled Backspace on keydown
      if (!didKeyDownBackspace.current) backspace();
      return;
    }
    if (inputType !== "insertText" || !data) return;

    for (const char of data) {
      if (char === " ") {
        submitWord();
      } else {
        start(); // no-op if already running
        typeChar(char);
      }
    }
  }, [words, isFinished, start, typeChar, backspace, submitWord]);

  const handleSelect = useCallback((e: React.UIEvent<HTMLInputElement>) => {
    const el = e.target as HTMLInputElement;
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const relTarget = e.relatedTarget as HTMLElement | null;
    if (relTarget?.id === "reset-btn" || relTarget?.dataset.configBtn) return; // don't blur when clicking reset
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

  let announcement = "";
  if (isFinished) {
    announcement = `Test complete. ${finalStats.wpm} words per minute, ${finalStats.accuracy} percent accuracy.`;
  } else if (isStarted) {
    announcement = !isWordsMode && seconds === WARNING_SECONDS ? `${WARNING_SECONDS} seconds left` : "Test started";
  }

  return (
    <>
      <LiveAnnouncer message={announcement} />
      {isFinished ? (
        <ResultCard
          stats={finalStats}
          durationSeconds={isWordsMode ? Math.round(finalElapsedMs / MS_PER_SECOND) : timeLimit}
          onReset={resetTest}
        />
      ) : (
    <div className="flex flex-col items-center w-full max-w-4xl gap-6 relative">

      <ConfigBar />
      <div className="flex items-center min-h-8 px-1 self-start">
        <CapsLockAlert isVisible={isCapsLockOn} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row w-full justify-between sm:items-end px-1 mb-2">
        <div className="flex gap-6 sm:gap-8">
          <LiveStat label="WPM" value={isStarted ? wpm : 0} />
          <LiveStat label="CPM" value={isStarted ? cpm : 0} />
          <LiveStat label="ACC" value={isStarted ? accuracy : 100} unit="%" />
        </div>
        <div className={`text-5xl font-mono tracking-tighter font-semibold transition-colors duration-300 opacity-90 ${!isWordsMode && seconds <= 5 ? "text-red-400" : "text-[#FFD523]"}`}>
          {isWordsMode ? `${Math.min(activeWordIndex, words.length)}/${words.length}` : seconds}
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
      >
        <input
          ref={textInput}
          autoFocus
          className="absolute left-0 top-0 w-px h-px opacity-0 pointer-events-none"
          id="typing-input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value=""
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onInput={handleInput}
          onChange={() => {}}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onSelect={handleSelect}
          type="text"
          aria-label="Typing input"
        />
      </TypingArea>

      <p data-focus-fade className={`text-xs text-slate-400 select-none ${FADE_CLASSES}`}>tab + enter — restart · esc — restart</p>

      <RestartButton onClick={resetTest} />
    </div>
      )}
    </>
  );
};

export default TypingTest;
