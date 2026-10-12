import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import TypingTest from "../TypingTest";
import { makeStore } from "../../redux/store";
import { getLetterStates } from "../../utils/typingEngine";

const KNOWN_WORDS = ["the", "cat", "sat", "mat", "hat", "bat"];

vi.mock("../../utils/getWords", () => ({
  getWords: (count: number) => Array.from({ length: count }, (_, i) => KNOWN_WORDS[i % KNOWN_WORDS.length]),
}));

// Word calls getLetterStates exactly once per render, so its call count = Word renders.
vi.mock("../../utils/typingEngine", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../utils/typingEngine")>();
  return { ...actual, getLetterStates: vi.fn(actual.getLetterStates) };
});

const getWordEls = () => Array.from(document.querySelectorAll<HTMLElement>("[data-word]"));

describe("TypingTest render cost", () => {
  beforeAll(() => {
    window.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it("re-renders at most 2 Words per letter keystroke (300 words loaded)", async () => {
    const user = userEvent.setup();
    const store = makeStore({ paragraph: { wordsCollection: KNOWN_WORDS, status: "ready", mode: "mixed", options: {}, quoteLength: null, source: null, round: 0 } });
    render(<Provider store={store}><TypingTest /></Provider>);
    await user.click(screen.getByLabelText("Type the words shown"));
    expect(getWordEls().length).toBeGreaterThan(40);

    const calls = vi.mocked(getLetterStates);
    const rendersFor = async (keys: string) => {
      calls.mockClear();
      await user.keyboard(keys);
      return calls.mock.calls.length;
    };

    expect(await rendersFor("t")).toBeLessThanOrEqual(2); // letter in a word
    expect(await rendersFor("he")).toBeLessThanOrEqual(4); // two letters
    expect(await rendersFor(" ")).toBeLessThanOrEqual(3); // submit: old + new active word + one newly windowed word
  });
});
