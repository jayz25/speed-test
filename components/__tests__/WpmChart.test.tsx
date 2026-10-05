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

  it("renders two polylines, a red dot per mistake second, 3 gridlabels and a text summary", () => {
    const { container } = render(<WpmChart samples={SAMPLES} />);
    expect(container.querySelectorAll("polyline")).toHaveLength(2);
    expect(container.querySelectorAll("circle")).toHaveLength(1);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", expect.stringContaining("ended at 45 WPM"));
    expect(container.querySelector("title")).toHaveTextContent(/WPM over 3 seconds/);
    // axis max 60 -> labels 20, 40, 60
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });
});
