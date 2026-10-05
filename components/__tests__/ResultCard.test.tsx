import { act, fireEvent, render, screen } from "@testing-library/react";
import ResultCard from "../ResultCard";
import type { TestStats } from "../../utils/calculateStats";

const CONFIG = { mode: "time", limit: 30, difficulty: "mixed" } as const;
const STATS: TestStats = {
  wpm: 72, rawWpm: 80, cpm: 360, accuracy: 96,
  correctChars: 300, incorrectChars: 12, extraChars: 3, missedChars: 5,
};

describe("ResultCard", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    // @ts-expect-error restore jsdom default (no matchMedia)
    delete window.matchMedia;
  });

  it("shows headline and detail stats", () => {
    render(<ResultCard stats={STATS} durationSeconds={30} config={CONFIG} onReset={vi.fn()} onRepeat={vi.fn()} />);
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("96")).toBeInTheDocument();
    const details = screen.getByText("Raw WPM").closest("div")!.parentElement!;
    expect(details).toHaveTextContent("80");
    expect(details).toHaveTextContent("Correct300");
    expect(details).toHaveTextContent("Incorrect12");
    expect(details).toHaveTextContent("Extra3");
    expect(details).toHaveTextContent("Missed5");
    expect(details).toHaveTextContent("Duration30s");
  });

  it("renders Next test and Repeat; Repeat calls onRepeat only", () => {
    const onReset = vi.fn();
    const onRepeat = vi.fn();
    render(<ResultCard stats={STATS} durationSeconds={30} config={CONFIG} onReset={onReset} onRepeat={onRepeat} />);
    expect(screen.getByRole("button", { name: /next test/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Repeat" }));
    expect(onRepeat).toHaveBeenCalledTimes(1);
    expect(onReset).not.toHaveBeenCalled();
  });

  it("resets on the button, Enter and Escape", () => {
    const onReset = vi.fn();
    render(<ResultCard stats={STATS} durationSeconds={30} config={CONFIG} onReset={onReset} onRepeat={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /next test/i }));
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onReset).toHaveBeenCalledTimes(3);
  });
});

describe("ResultCard personal best and grade", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    // @ts-expect-error restore jsdom default (no matchMedia)
    delete window.matchMedia;
  });
  const renderCard = (personalBest?: { previousBest: number | null }, stats = STATS) =>
    render(<ResultCard stats={stats} durationSeconds={30} config={CONFIG} onReset={vi.fn()} onRepeat={vi.fn()} personalBest={personalBest} />);

  it("shows the new personal best badge on a first run or a beaten record", () => {
    renderCard({ previousBest: null });
    expect(screen.getByText("New personal best!")).toBeInTheDocument();
  });

  it("shows the old PB and the gap otherwise", () => {
    renderCard({ previousBest: 80 });
    expect(screen.getByText("PB: 80 wpm (−8)")).toBeInTheDocument();
  });

  it("shows no PB line while unknown", () => {
    renderCard(undefined);
    expect(screen.queryByText(/personal best|PB:/)).not.toBeInTheDocument();
  });

  it("grades by wpm and accuracy", () => {
    renderCard(undefined, { ...STATS, wpm: 85, accuracy: 98 });
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("does not give S for high accuracy at low wpm", () => {
    renderCard(undefined, { ...STATS, wpm: 20, accuracy: 100 });
    expect(screen.getByText("D")).toBeInTheDocument();
  });
});

describe("ResultCard copy", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    // @ts-expect-error restore jsdom default (no matchMedia)
    delete window.matchMedia;
  });

  const stubClipboard = (writeText: () => Promise<void>) =>
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  const renderCard = () =>
    render(<ResultCard stats={STATS} durationSeconds={30} config={CONFIG} onReset={vi.fn()} onRepeat={vi.fn()} />);

  it("copies the summary and shows Copied! for 1.5s", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: "Copy result" }));
    expect(await screen.findByRole("button", { name: "Copied!" })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith("SpeedType \u2014 72 wpm \u00b7 96% acc \u00b7 30s mixed");
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.getByRole("button", { name: "Copy result" })).toBeInTheDocument();
  });

  it("shows Couldn't copy when the clipboard rejects", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: "Copy result" }));
    expect(await screen.findByRole("button", { name: "Couldn't copy" })).toBeInTheDocument();
  });

  it("shows Couldn't copy when the clipboard API is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: "Copy result" }));
    expect(await screen.findByRole("button", { name: "Couldn't copy" })).toBeInTheDocument();
  });
});
