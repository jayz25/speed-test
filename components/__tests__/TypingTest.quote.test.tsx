import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import TypingTest from "../TypingTest";
import { makeStore } from "../../redux/store";
import { setSetting } from "../../redux/settings";
import { QUOTES } from "../../utils/quotes";
import { HISTORY_KEY } from "../../utils/storage";

describe("TypingTest quote mode", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
    window.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });
  beforeEach(() => localStorage.clear());

  const setup = () => {
    const store = makeStore();
    store.dispatch(setSetting({ mode: "quote", quoteLength: "short" }));
    render(<Provider store={store}><TypingTest /></Provider>);
    return { store, user: userEvent.setup() };
  };

  it("shows the quote exactly as written with its source under the typing area", async () => {
    const { store } = setup();
    const total = await screen.findByText(/^0\/\d+$/);
    const { wordsCollection, source } = store.getState().paragraph;
    expect(total).toHaveTextContent(`0/${wordsCollection.length}`);
    expect(Array.from(document.querySelectorAll("[data-word]")).map((el) => el.textContent)).toEqual(wordsCollection);
    expect(QUOTES.some((q) => q.text === wordsCollection.join(" ") && q.source === source)).toBe(true);
    expect(screen.getByText(`— ${source}`)).toBeInTheDocument();
  });

  it("finishes on the last word, shows the source on the result and records a quote run", async () => {
    const { store, user } = setup();
    await screen.findByText(/^0\/\d+$/);
    const { wordsCollection, source } = store.getState().paragraph;
    await user.keyboard(wordsCollection.join(" "));
    expect(await screen.findByRole("button", { name: /next test/i })).toBeInTheDocument();
    expect(screen.getByText("quote · short")).toBeInTheDocument();
    expect(screen.getByText(`— ${source}`)).toBeInTheDocument();
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ mode: "quote", limit: 1, difficulty: "mixed" });
  });
});
