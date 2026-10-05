import { fireEvent, render, screen } from "@testing-library/react";
import ResultCard from "../ResultCard";
import type { TestStats } from "../../utils/calculateStats";

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
    render(<ResultCard stats={STATS} durationSeconds={30} onReset={vi.fn()} onRepeat={vi.fn()} />);
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
    render(<ResultCard stats={STATS} durationSeconds={30} onReset={onReset} onRepeat={onRepeat} />);
    expect(screen.getByRole("button", { name: /next test/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Repeat" }));
    expect(onRepeat).toHaveBeenCalledTimes(1);
    expect(onReset).not.toHaveBeenCalled();
  });

  it("resets on the button, Enter and Escape", () => {
    const onReset = vi.fn();
    render(<ResultCard stats={STATS} durationSeconds={30} onReset={onReset} onRepeat={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /next test/i }));
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onReset).toHaveBeenCalledTimes(3);
  });
});
