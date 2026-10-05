import { render, screen } from "@testing-library/react";
import RenderStat from "../RenderStat";

const mockReducedMotion = (matches: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
};

describe("RenderStat", () => {
  afterEach(() => {
    // @ts-expect-error restore jsdom default (no matchMedia)
    delete window.matchMedia;
    vi.restoreAllMocks();
  });

  it("shows the final value immediately when reduced motion is requested", () => {
    mockReducedMotion(true);
    const raf = vi.spyOn(window, "requestAnimationFrame");
    render(<RenderStat targetValue={87} />);
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(raf).not.toHaveBeenCalled();
  });

  it("animates from 0 otherwise and cancels the frame on unmount", () => {
    mockReducedMotion(false);
    const raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(42);
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(<RenderStat targetValue={87} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(raf).toHaveBeenCalled();
    unmount();
    expect(cancel).toHaveBeenCalledWith(42);
  });
});
