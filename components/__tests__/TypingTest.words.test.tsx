import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import TypingTest from "../TypingTest";
import { makeStore } from "../../redux/store";
import { setSetting } from "../../redux/settings";

const KNOWN_WORDS = ["the", "cat", "sat", "mat", "hat", "bat", "rat", "pat", "fat", "vat"];

vi.mock("../../utils/getWords", () => ({
  getWords: (count: number) => Array.from({ length: count }, (_, i) => KNOWN_WORDS[i % KNOWN_WORDS.length]),
}));

describe("TypingTest words mode", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
    window.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  const setup = () => {
    const store = makeStore();
    store.dispatch(setSetting({ mode: "words", wordCount: 10 }));
    render(<Provider store={store}><TypingTest /></Provider>);
    return userEvent.setup();
  };

  it("generates exactly wordCount words and shows typed/total progress", async () => {
    const user = setup();
    expect(await screen.findByText("0/10")).toBeInTheDocument();
    expect(document.querySelectorAll("[data-word]")).toHaveLength(10);
    await user.keyboard("the cat ");
    expect(screen.getByText("2/10")).toBeInTheDocument();
  });

  it("finishes after typing the last word's final character (no space needed)", async () => {
    const user = setup();
    await screen.findByText("0/10");
    await user.keyboard(KNOWN_WORDS.slice(0, 9).map((w) => `${w} `).join(""));
    expect(screen.queryByText("Test Complete")).not.toBeInTheDocument();
    await user.keyboard("vat");
    expect(await screen.findByText("Test Complete")).toBeInTheDocument();
  });

  it("finishes on submitting a wrong last word", async () => {
    const user = setup();
    await screen.findByText("0/10");
    await user.keyboard(KNOWN_WORDS.slice(0, 9).map((w) => `${w} `).join(""));
    await user.keyboard("zz ");
    expect(await screen.findByText("Test Complete")).toBeInTheDocument();
  });
});
