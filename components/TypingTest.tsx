"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../types/types";
import { loadWords, refreshWords, repeatWords } from "../redux/paragraph";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateStats, TestStats } from "../utils/calculateStats";
import useTimer from "../utils/hooks/useTimer";
import { useFocusMode } from "../utils/hooks/useFocusMode";
import { useCaret } from "../utils/hooks/useCaret";
import { usePostResultOnFinish } from "../utils/hooks/usePostResultOnFinish";
import { useRecordResult } from "../utils/hooks/useRecordResult";
import { usePlayerName } from "../utils/hooks/usePlayerName";
import { sanitizePlayerName } from "../utils/playerName";
import { useTypingEngine } from "../utils/hooks/useTypingEngine";
import { getWordCounts } from "../utils/typingEngine";
import { makeSample, WpmSample } from "../utils/wpmSamples";
import CapsLockAlert from "./CapsLockAlert";
import LiveAnnouncer from "./LiveAnnouncer";
import LiveStatsPanel from "./LiveStatsPanel";
import ResultCard from "./ResultCard";
import SettingsPanel from "./SettingsPanel";
import TimerRow from "./TimerRow";
import { RotateCcwIcon } from "./icons";
import TypingArea from "./TypingArea";

const INITIAL_STATS: TestStats = {
  wpm: 0, rawWpm: 0, cpm: 0, accuracy: 100,
  correctChars: 0, incorrectChars: 0, extraChars: 0, missedChars: 0,
};
const WARNING_SECONDS = 10;
const SECONDS_PER_MINUTE = 60;
const REFOCUS_DELAY_MS = 30;
const MS_PER_SECOND = 1000;
/** Words generated for time mode; more than anyone can type in the longest limit. */
const TIME_MODE_WORDS = 300;

const TypingTest = () => {
  const words = useSelector((state: RootState) => state.paragraph.wordsCollection);
  const round = useSelector((state: RootState) => state.paragraph.round);
  const dispatch = useDispatch<AppDispatch>();

  const { mode, timeLimit, wordCount, difficulty, punctuation, numbers } = useSelector((state: RootState) => state.settings);

  // (Re)generate words whenever a setting changes (and on mount)
  useEffect(() => {
    dispatch(loadWords({ count: mode === "words" ? wordCount : TIME_MODE_WORDS, mode: difficulty, punctuation, numbers }));
  }, [dispatch, mode, wordCount, difficulty, punctuation, numbers, timeLimit]);

  const isWordsMode = mode === "words";
  const { state, typeChar, backspace, submitWord, finish, activeLetterIndex } = useTypingEngine(words, { finishOnLastWord: isWordsMode, round });
  const { activeWordIndex } = state;
  const isStarted = state.status === "running";
  const isFinished = state.status === "finished";

  useFocusMode(isStarted);

  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTabArmed, setIsTabArmed] = useState(false);
  const targetRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const textInput = useRef<HTMLInputElement>(null);
  const didKeyDownBackspace = useRef(false);

  const { seconds, elapsedSeconds, start, stop: stopTimer, reset, elapsedMs } = useTimer(timeLimit, isWordsMode ? "up" : "down");

  // Computed stats
  // Live stats are recomputed once per timer tick (or new test), not per keystroke
  const liveStats = useMemo(
    () => calculateStats(state, elapsedMs()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seconds, state.words],
  );

  // Time mode: game over when the countdown reaches 0 (words mode ends in the engine)
  useEffect(() => {
    if (!isWordsMode && seconds === 0 && isStarted) finish();
  }, [isWordsMode, seconds, isStarted, finish]);

  // Sample WPM / raw WPM / mistakes once per elapsed second while running (for the result chart)
  const samplesRef = useRef<WpmSample[]>([]);
  const incorrectAtLastSample = useRef(0);
  const [finalSamples, setFinalSamples] = useState<readonly WpmSample[]>([]);
  // Mirror of samplesRef so the live sparkline re-renders when a sample is pushed
  const [liveSamples, setLiveSamples] = useState<readonly WpmSample[]>([]);
  const pushSample = useCallback((second: number) => {
    const last = samplesRef.current[samplesRef.current.length - 1];
    if (last && last.second >= second) return;
    samplesRef.current = [...samplesRef.current, makeSample(state, second, incorrectAtLastSample.current)];
    incorrectAtLastSample.current = state.incorrectKeystrokes;
  }, [state]);

  useEffect(() => {
    if (state.status === "idle") {
      samplesRef.current = [];
      incorrectAtLastSample.current = 0;
      // Mirrors the ref-backed sampler into state; see Parking lot for a ref-free rewrite
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiveSamples((prev) => (prev.length === 0 ? prev : []));
    } else if (isStarted && elapsedSeconds >= 1) {
      pushSample(elapsedSeconds);
      setLiveSamples((prev) => (prev === samplesRef.current ? prev : samplesRef.current));
    }
  }, [state.status, isStarted, elapsedSeconds, pushSample]);

  // The result is derived (not stored) so it is already correct in the first finished render,
  // which the post/record hooks rely on. Engine state is stable once finished.
  const finalElapsedMs = useMemo(() => (isFinished ? elapsedMs() : 0), [isFinished, elapsedMs]);
  const finalStats = useMemo(
    () => (isFinished ? calculateStats(state, finalElapsedMs) : INITIAL_STATS),
    [isFinished, state, finalElapsedMs],
  );

  // Freeze the clock and finish the chart samples once the engine reports finished
  useEffect(() => {
    if (!isFinished) return;
    stopTimer();
    pushSample(Math.max(1, Math.round(finalElapsedMs / MS_PER_SECOND)));
    setFinalSamples(samplesRef.current);
  }, [isFinished, finalElapsedMs, stopTimer, pushSample]);

  const [playerName] = usePlayerName();

  usePostResultOnFinish({
    isFinished, roundId: state.round, wpm: finalStats.wpm, cpm: finalStats.cpm, accuracy: finalStats.accuracy, user: sanitizePlayerName(playerName),
  });

  const personalBest = useRecordResult({
    isFinished,
    roundId: state.round,
    stats: finalStats,
    config: { mode, limit: isWordsMode ? wordCount : timeLimit, difficulty },
  });

  useCaret({
    boxRef, targetRef,
    deps: [activeWordIndex, activeLetterIndex, words, round, isFocused, isFinished],
  });

  // Reset view state whenever the word list changes (engine resets itself)
  useEffect(() => {
    if (words.length > 0) {
      textInput.current?.focus();
    }
  }, [words, round]);

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
    setIsTabArmed(false);
    textInput.current?.focus();
    // The click that triggered the reset may steal focus back; refocus once it settles
    setTimeout(() => textInput.current?.focus(), REFOCUS_DELAY_MS);
  }, [reset, dispatch, timeLimit]);

  // Same words, fresh test (the engine restarts when the paragraph round changes)
  const repeatTest = useCallback(() => {
    reset(timeLimit);
    dispatch(repeatWords());
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
      // Tab + Enter restarts instead of moving focus to the settings
      e.preventDefault();
      setIsTabArmed(true);
      return;
    }
    if (e.key === "Enter" && isTabArmed) {
      e.preventDefault();
      resetTest();
      return;
    }
    if (e.key !== "Shift") setIsTabArmed(false);
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
  }, [words, isFinished, isTabArmed, resetTest, backspace, submitWord]);

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

  // A setting change refocuses the input via the words effect; onFocus then restores isFocused
  const handleBlur = useCallback(() => {
    setIsTabArmed(false);
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

  const remainingSeconds = Math.ceil(Math.max(0, seconds));
  const timeLabel = `${Math.floor(remainingSeconds / SECONDS_PER_MINUTE)}:${String(remainingSeconds % SECONDS_PER_MINUTE).padStart(2, "0")}`;
  const wordIndex = Math.min(activeWordIndex, words.length);
  const timerRow = isWordsMode
    ? { label: `${wordIndex}/${words.length}`, goal: `${elapsedSeconds}s`, progress: words.length > 0 ? wordIndex / words.length : 0 }
    : { label: timeLabel, goal: `${timeLimit}s`, progress: timeLimit > 0 ? elapsedSeconds / timeLimit : 0 };

  const shownStats = isFinished ? finalStats : liveStats;
  const liveStatsProps = state.status === "idle" ? null : {
    wpm: shownStats.wpm,
    cpm: shownStats.cpm,
    accuracy: shownStats.accuracy,
    errors: state.incorrectKeystrokes,
    words: getWordCounts(state).wordsMatched,
  };
  const series = (isFinished ? finalSamples : liveSamples).map((sample) => sample.wpm);

  return (
    <>
      <LiveAnnouncer message={announcement} />
      <main className="mx-auto flex w-full max-w-[1360px] flex-wrap items-start gap-5 px-4 pt-6 pb-12 sm:px-8 sm:pt-10">
        <SettingsPanel isDimmed={isStarted} />
        <section
          aria-label="Typing test"
          className="flex min-w-0 shrink grow-999 basis-[560px] flex-col gap-7 rounded-card bg-surface px-5 py-6 shadow-card sm:px-11 sm:py-10"
        >
          {isFinished ? (
            <ResultCard
              stats={finalStats}
              samples={finalSamples}
              personalBest={personalBest}
              config={{ mode, limit: isWordsMode ? wordCount : timeLimit, difficulty }}
              options={{ punctuation, numbers }}
              durationSeconds={isWordsMode ? Math.round(finalElapsedMs / MS_PER_SECOND) : timeLimit}
              onReset={resetTest}
              onRepeat={repeatTest}
            />
          ) : (
            <>
              <TimerRow {...timerRow} />
              <CapsLockAlert isVisible={isCapsLockOn} />
              <TypingArea
                state={state}
                activeLetterIndex={activeLetterIndex}
                isFocused={isFocused}
                isIdle={state.status === "idle"}
                boxRef={boxRef}
                targetRef={targetRef}
                onClick={handleContainerClick}
                onMouseDown={handleContainerMouseDown}
              >
                <input
                  ref={textInput}
                  autoFocus
                  className="absolute inset-0 h-full w-full cursor-text border-0 p-0 opacity-0 caret-transparent"
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
                  aria-label="Type the words shown"
                />
              </TypingArea>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-divider pt-5">
                <button
                  type="button"
                  onClick={resetTest}
                  className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-border bg-surface px-[18px] text-[15px] font-semibold text-ink"
                >
                  <RotateCcwIcon />
                  Restart
                </button>
                <p className="flex items-center gap-2 text-[13px] text-muted">
                  <kbd className={`rounded-md border border-border px-2 py-[3px] font-mono text-xs text-ink ${isTabArmed ? "bg-accent-soft" : "bg-kbd-bg"}`}>tab</kbd>
                  +
                  <kbd className="rounded-md border border-border bg-kbd-bg px-2 py-[3px] font-mono text-xs text-ink">enter</kbd>
                  to restart
                </p>
              </div>
            </>
          )}
        </section>
        <LiveStatsPanel stats={liveStatsProps} series={series} />
      </main>
    </>
  );
};

export default TypingTest;
