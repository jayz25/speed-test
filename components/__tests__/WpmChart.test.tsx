import { render, screen } from "@testing-library/react";
import WpmChart from "../WpmChart";
import type { WpmSample } from "../../utils/wpmSamples";

const SAMPLES: WpmSample[] = [
  { second: 1, wpm: 20, rawWpm: 30, errors: 0 },
  { second: 2, wpm: 40, rawWpm: 52, errors: 2 },
  { second: 3, wpm: 45, rawWpm: 55, errors: 0 },
];

describe("WpmChart", () => {
  it("renders nothing with fewer than two samples", () => {
    const { container } = render(<WpmChart samples={SAMPLES.slice(0, 1)} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one WPM polyline with an area, y/x labels and a text summary", () => {
    const { container } = render(<WpmChart samples={SAMPLES} />);
    expect(container.querySelectorAll("polyline")).toHaveLength(1);
    expect(container.querySelectorAll("polygon")).toHaveLength(1);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", expect.stringContaining("ended at 45 WPM"));
    expect(screen.getByText("Speed over the test")).toBeInTheDocument();
    // y max = peak WPM (45), floor 40
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("0s")).toBeInTheDocument();
    expect(screen.getByText("3s")).toBeInTheDocument();
  });

  it("scales the y-axis to the peak WPM when above 40", () => {
    render(<WpmChart samples={[{ ...SAMPLES[0], wpm: 90 }, SAMPLES[1]]} />);
    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("keeps the y-axis at 40 for slow tests", () => {
    render(<WpmChart samples={SAMPLES.map((s) => ({ ...s, wpm: 10 }))} />);
    expect(screen.getByText("40")).toBeInTheDocument();
  });
});
