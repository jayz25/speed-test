import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import TypingTest from "../TypingTest";
import { makeStore } from "../../redux/store";

const KNOWN_WORDS = ["the", "cat", "sat", "mat", "hat", "bat"];

vi.mock("../../utils/getWords", () => ({
  getWords: (count: number) => Array.from({ length: count }, (_, i) => KNOWN_WORDS[i % KNOWN_WORDS.length]),
}));

// Words are aria-hidden (read via the live region), so query them by attribute
const getWordEls = () => Array.from(document.querySelectorAll<HTMLElement>("[data-word]"));

const renderTest = () => {
  const store = makeStore({ paragraph: { wordsCollection: KNOWN_WORDS, status: "ready", mode: "mixed" } });
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
    expect(getWordEls().length).toBeGreaterThan(0);
  });

  it("does not mark a correctly typed first word as wrong", async () => {
    const user = userEvent.setup();
    renderTest();
    await user.click(screen.getByLabelText("Typing input"));
    await user.keyboard("the ");
    const [firstWord] = getWordEls();
    expect(firstWord.className).not.toContain("underline");
  });

  it("marks a wrongly typed first word as wrong", async () => {
    const user = userEvent.setup();
    renderTest();
    await user.click(screen.getByLabelText("Typing input"));
    await user.keyboard("thx ");
    const [firstWord] = getWordEls();
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
    expect(getWordEls()[0].className).toContain("underline");
    await user.keyboard("{Escape}");
    expect(getWordEls()[0].className).not.toContain("underline");
  });

  it("Tab moves focus to the restart button, not the duration buttons", async () => {
    const user = userEvent.setup();
    renderTest();
    await user.click(screen.getByLabelText("Typing input"));
    await user.keyboard("thx ");
    await user.keyboard("{Tab}");
    expect(screen.getByRole("button", { name: /restart test/i })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(getWordEls()[0].className).not.toContain("underline");
    expect(screen.getByLabelText("Typing input")).toHaveFocus();
  });

  it("shows the shortcut hint", () => {
    renderTest();
    expect(screen.getByText(/tab \+ enter — restart · esc — restart/)).toBeInTheDocument();
  });

  describe("accessibility", () => {
    it("hides the words from assistive tech and labels no individual word", () => {
      renderTest();
      const [firstWord] = getWordEls();
      expect(firstWord.closest("[aria-hidden='true']")).not.toBeNull();
      expect(firstWord).not.toHaveAttribute("aria-label");
    });

    it("does not expose the typing area as a button", () => {
      renderTest();
      expect(screen.queryByRole("button", { name: /typing area/i })).not.toBeInTheDocument();
    });

    it("marks the selected duration with aria-pressed", async () => {
      const user = userEvent.setup();
      renderTest();
      expect(screen.getByRole("button", { name: "30s" })).toHaveAttribute("aria-pressed", "true");
      await user.click(screen.getByRole("button", { name: "60s" }));
      expect(screen.getByRole("button", { name: "60s" })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: "30s" })).toHaveAttribute("aria-pressed", "false");
    });

    it("announces the test start in a polite live region", async () => {
      const user = userEvent.setup();
      renderTest();
      const region = screen.getByRole("status");
      expect(region).toHaveAttribute("aria-live", "polite");
      expect(region).toHaveTextContent("");
      await user.click(screen.getByLabelText("Typing input"));
      await user.keyboard("t");
      expect(region).toHaveTextContent("Test started");
    });
  });
});
