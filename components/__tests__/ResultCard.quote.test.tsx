import { render, screen } from "@testing-library/react";
import ResultCard from "../ResultCard";
import type { TestStats } from "../../utils/calculateStats";

const STATS: TestStats = {
  wpm: 72, rawWpm: 80, cpm: 360, accuracy: 96,
  correctChars: 300, incorrectChars: 12, extraChars: 3, missedChars: 5,
};
const QUOTE_CONFIG = { mode: "quote", limit: 2, difficulty: "mixed" } as const;
const OPTIONS = { punctuation: false, numbers: false };

const renderCard = (props: Partial<React.ComponentProps<typeof ResultCard>> = {}) =>
  render(
    <ResultCard
      stats={STATS}
      durationSeconds={20}
      config={QUOTE_CONFIG}
      options={OPTIONS}
      onReset={vi.fn()}
      onRepeat={vi.fn()}
      {...props}
    />,
  );

describe("ResultCard in quote mode", () => {
  it("summarises the run as the quote tier and shows the source", () => {
    renderCard({ source: "Mark Twain" });
    expect(screen.getByText("quote · medium")).toBeInTheDocument();
    expect(screen.getByText("— Mark Twain")).toBeInTheDocument();
  });

  it("shows no source line without one", () => {
    renderCard({ source: null });
    expect(screen.queryByText(/—/)).not.toBeInTheDocument();
  });

  it("does not show a source outside quote mode", () => {
    renderCard({ config: { mode: "time", limit: 30, difficulty: "mixed" }, source: "Mark Twain" });
    expect(screen.queryByText("— Mark Twain")).not.toBeInTheDocument();
  });

  it("offers to repeat the same quote", () => {
    renderCard();
    expect(screen.getByRole("button", { name: "Repeat same quote" })).toBeInTheDocument();
  });

  it("flags an implausible result as not saved instead of a personal best", () => {
    renderCard({ stats: { ...STATS, wpm: 6000, cpm: 30000 }, personalBest: { previousBest: null } });
    expect(screen.getByText(/Not saved/)).toBeInTheDocument();
    expect(screen.queryByText("New personal best!")).toBeNull();
  });
});
