import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import TypingTest from "../TypingTest";
import { makeStore } from "../../redux/store";

const mocks = vi.hoisted(() => ({ loaded: [] as string[] }));
vi.mock("../../utils/getWords", () => ({ getWords: () => mocks.loaded }));

const renderWith = (wordsCollection: string[]) => {
  mocks.loaded = wordsCollection;
  const store = makeStore({ paragraph: { wordsCollection, status: "ready", mode: "mixed", options: {}, round: 0 } });
  render(<Provider store={store}><TypingTest /></Provider>);
};

describe("typing area loading state", () => {
  beforeAll(() => {
    window.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it("shows 3 skeleton lines before words load", () => {
    renderWith([]);
    const skeleton = screen.getByTestId("typing-skeleton");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton.querySelectorAll(".animate-pulse, [class*='animate-pulse']")).toHaveLength(3);
  });

  it("does not show the skeleton once words are loaded", () => {
    renderWith(["the", "cat"]);
    expect(screen.queryByTestId("typing-skeleton")).not.toBeInTheDocument();
  });
});
