import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import TypingTest from "../TypingTest";
import { makeStore } from "../../redux/store";

const KNOWN_WORDS = ["the", "cat", "sat", "mat", "hat", "bat"];

vi.mock("../../utils/getWords", () => ({
  getWords: (count: number) => Array.from({ length: count }, (_, i) => KNOWN_WORDS[i % KNOWN_WORDS.length]),
}));

const getWordEls = () => Array.from(document.querySelectorAll<HTMLElement>("[data-word]"));
const letterClass = (word: number, letter: number) => getWordEls()[word].querySelectorAll("span")[letter].className;
const getInput = () => screen.getByLabelText("Typing input");

const insert = (data: string) => fireEvent.input(getInput(), { inputType: "insertText", data });
const deleteBackward = () => fireEvent.input(getInput(), { inputType: "deleteContentBackward" });

describe("TypingTest input-event path (soft keyboards)", () => {
  beforeEach(() => {
    window.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    Element.prototype.scrollIntoView = vi.fn();
    const store = makeStore({ paragraph: { wordsCollection: KNOWN_WORDS, status: "ready", mode: "mixed", options: {} } });
    render(<Provider store={store}><TypingTest /></Provider>);
  });

  it("renders a 1px hidden input (iOS needs a non-zero size to open the keyboard)", () => {
    expect(getInput().className).toContain("w-px");
    expect(getInput().className).toContain("h-px");
  });

  it("types a character from an insertText input event", () => {
    insert("t");
    expect(letterClass(0, 0)).toContain("text-slate-100");
  });

  it("types every character of a multi-char insertText and submits on space", () => {
    insert("thx ");
    expect(getWordEls()[0].className).toContain("underline"); // 'thx' != 'the', submitted
    insert("c");
    expect(letterClass(1, 0)).toContain("text-slate-100");
  });

  it("deleteContentBackward removes the last typed character", () => {
    insert("th");
    deleteBackward();
    expect(letterClass(0, 1)).toContain("text-slate-500");
    expect(letterClass(0, 0)).toContain("text-slate-100");
  });

  it("starts the live region announcement from the input path", () => {
    insert("t");
    expect(screen.getByRole("status")).toHaveTextContent("Test started");
  });

  it("ignores keydown with key 'Unidentified' and printable keydowns (input path owns them)", () => {
    fireEvent.keyDown(getInput(), { key: "Unidentified" });
    fireEvent.keyDown(getInput(), { key: "t" });
    expect(letterClass(0, 0)).toContain("text-slate-500");
  });

  it("does not double-handle Backspace (keydown then input)", () => {
    insert("the");
    fireEvent.keyDown(getInput(), { key: "Backspace" });
    deleteBackward(); // desktop browsers may also fire this
    expect(letterClass(0, 1)).toContain("text-slate-100"); // only 'e' removed
    expect(letterClass(0, 2)).toContain("text-slate-500");
    fireEvent.keyUp(getInput(), { key: "Backspace" });
  });

  it("ignores composition keydowns and unsupported input types", () => {
    fireEvent.keyDown(getInput(), { key: "a", isComposing: true });
    fireEvent.input(getInput(), { inputType: "insertCompositionText", data: "a" });
    expect(letterClass(0, 0)).toContain("text-slate-500");
  });

  it("keeps Space (keydown) submitting words and Tab moving to the restart button", () => {
    insert("the");
    fireEvent.keyDown(getInput(), { key: " ", code: "Space" });
    insert("c");
    expect(letterClass(1, 0)).toContain("text-slate-100");
    fireEvent.keyDown(getInput(), { key: "Tab" });
    expect(screen.getByRole("button", { name: /restart test/i })).toHaveFocus();
  });
});
