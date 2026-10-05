import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import TypingTest from "../TypingTest";
import { makeStore } from "../../redux/store";

const KNOWN_WORDS = ["the", "cat", "sat", "mat", "hat", "bat"];

vi.mock("../../utils/getWords", () => ({
  getWords: (count: number) => Array.from({ length: count }, (_, i) => KNOWN_WORDS[i % KNOWN_WORDS.length]),
}));

const renderTest = () => {
  const store = makeStore({ paragraph: { wordsCollection: KNOWN_WORDS, status: "ready" } });
  render(
    <Provider store={store}>
      <TypingTest />
    </Provider>,
  );
  return store;
};

describe("TypingTest", () => {
  beforeAll(() => {
    // jsdom lacks layout APIs used by caret tracking
    Element.prototype.scrollIntoView = vi.fn();
    window.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it("renders the live WPM stat and the loaded words", () => {
    renderTest();
    expect(screen.getByText("WPM")).toBeInTheDocument();
    expect(screen.getAllByLabelText("the").length).toBeGreaterThan(0);
  });

  it("does not mark a correctly typed first word as wrong", async () => {
    const user = userEvent.setup();
    renderTest();
    await user.click(screen.getByLabelText("Typing input"));
    await user.keyboard("the ");
    const [firstWord] = screen.getAllByLabelText("the");
    expect(firstWord.className).not.toContain("underline");
  });

  it("marks a wrongly typed first word as wrong", async () => {
    const user = userEvent.setup();
    renderTest();
    await user.click(screen.getByLabelText("Typing input"));
    await user.keyboard("thx ");
    const [firstWord] = screen.getAllByLabelText("the");
    expect(firstWord.className).toContain("underline");
  });

  it("focuses the input on mount so the focus overlay is not shown", () => {
    renderTest();
    expect(screen.getByLabelText("Typing input")).toHaveFocus();
    expect(screen.queryByText(/click to focus/i)).not.toBeInTheDocument();
  });

  it("Escape restarts the test", async () => {
    const user = userEvent.setup();
    renderTest();
    await user.click(screen.getByLabelText("Typing input"));
    await user.keyboard("thx ");
    expect(screen.getAllByLabelText("the")[0].className).toContain("underline");
    await user.keyboard("{Escape}");
    expect(screen.getAllByLabelText("the")[0].className).not.toContain("underline");
  });

  it("Tab moves focus to the restart button, not the duration buttons", async () => {
    const user = userEvent.setup();
    renderTest();
    await user.click(screen.getByLabelText("Typing input"));
    await user.keyboard("thx ");
    await user.keyboard("{Tab}");
    expect(screen.getByRole("button", { name: /restart test/i })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getAllByLabelText("the")[0].className).not.toContain("underline");
    expect(screen.getByLabelText("Typing input")).toHaveFocus();
  });

  it("shows the shortcut hint", () => {
    renderTest();
    expect(screen.getByText(/tab \+ enter — restart · esc — restart/)).toBeInTheDocument();
  });
});
