import { render, screen } from "@testing-library/react";
import LiveStatsPanel from "../LiveStatsPanel";

describe("LiveStatsPanel", () => {
  it("shows an em dash for every value when stats are null", () => {
    render(<LiveStatsPanel stats={null} series={[]} />);
    expect(screen.getAllByText("—")).toHaveLength(5);
  });

  it("shows values with a percent sign on accuracy", () => {
    render(<LiveStatsPanel stats={{ wpm: 72, cpm: 360, accuracy: 96, errors: 3, words: 18 }} series={[10, 40, 72]} />);
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("96%")).toBeInTheDocument();
    expect(screen.getByText("360")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /words per minute/i })).toBeInTheDocument();
  });
});
