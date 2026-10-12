import { makeStore } from "../store";
import { loadWords, refreshWords, repeatWords } from "../paragraph";
import { getWords } from "../../utils/getWords";
import { addStatCall, getStatCall } from "../stat";
import { getQuoteLength, QUOTES } from "../../utils/quotes";

vi.mock("../../utils/getWords", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../utils/getWords")>();
  return { ...actual, getWords: vi.fn(actual.getWords) };
});

describe("paragraph slice", () => {
  it("loadWords fills the collection and marks ready", () => {
    const store = makeStore();
    store.dispatch(loadWords({ count: 10, mode: "easy" }));
    expect(store.getState().paragraph.wordsCollection).toHaveLength(10);
    expect(store.getState().paragraph.status).toBe("ready");
  });
  it("loadWords defaults to 60 words", () => {
    const store = makeStore();
    store.dispatch(loadWords());
    expect(store.getState().paragraph.wordsCollection).toHaveLength(60);
  });
  it("refreshWords keeps the current word count", () => {
    const store = makeStore();
    store.dispatch(loadWords({ count: 12 }));
    store.dispatch(refreshWords());
    expect(store.getState().paragraph.wordsCollection).toHaveLength(12);
  });
  it("refreshWords reuses the mode passed to loadWords", () => {
    const store = makeStore();
    store.dispatch(loadWords({ count: 5, mode: "easy" }));
    expect(store.getState().paragraph.mode).toBe("easy");
    vi.mocked(getWords).mockClear();
    store.dispatch(refreshWords());
    expect(getWords).toHaveBeenCalledWith(5, "easy", { punctuation: false, numbers: false });
    expect(store.getState().paragraph.mode).toBe("easy");
  });
  it("mode defaults to mixed", () => {
    const store = makeStore();
    store.dispatch(loadWords());
    expect(store.getState().paragraph.mode).toBe("mixed");
  });
  it("refreshWords falls back to 60 when empty", () => {
    const store = makeStore();
    store.dispatch(refreshWords());
    expect(store.getState().paragraph.wordsCollection).toHaveLength(60);
  });
});

describe("paragraph slice quote path", () => {
  const sourceOf = (text: string) => QUOTES.find((q) => q.text === text)?.source;

  it("loadWords with a quoteLength loads a quote of that tier, split into exact words, with its source", () => {
    const store = makeStore();
    store.dispatch(loadWords({ quoteLength: "short" }));
    const { wordsCollection, source, quoteLength, status } = store.getState().paragraph;
    const text = wordsCollection.join(" ");
    expect(getQuoteLength({ text, source: "" })).toBe("short");
    expect(source).toBe(sourceOf(text));
    expect(quoteLength).toBe("short");
    expect(status).toBe("ready");
  });
  it("ignores difficulty, punctuation and numbers for quotes", () => {
    const store = makeStore();
    store.dispatch(loadWords({ quoteLength: "medium", mode: "easy", punctuation: true, numbers: true, count: 3 }));
    const text = store.getState().paragraph.wordsCollection.join(" ");
    expect(QUOTES.some((q) => q.text === text)).toBe(true);
  });
  it("refreshWords picks a different quote of the same tier", () => {
    const store = makeStore();
    store.dispatch(loadWords({ quoteLength: "long" }));
    for (let i = 0; i < 20; i++) {
      const before = store.getState().paragraph.wordsCollection.join(" ");
      store.dispatch(refreshWords());
      const after = store.getState().paragraph;
      expect(after.wordsCollection.join(" ")).not.toBe(before);
      expect(after.quoteLength).toBe("long");
      expect(after.source).toBe(sourceOf(after.wordsCollection.join(" ")));
    }
  });
  it("repeatWords keeps the same quote and source but starts a new round", () => {
    const store = makeStore();
    store.dispatch(loadWords({ quoteLength: "medium" }));
    const before = store.getState().paragraph;
    store.dispatch(repeatWords());
    const after = store.getState().paragraph;
    expect(after.wordsCollection).toEqual(before.wordsCollection);
    expect(after.source).toBe(before.source);
    expect(after.round).toBe(before.round + 1);
  });
  it("loading random words afterwards clears the quote state", () => {
    const store = makeStore();
    store.dispatch(loadWords({ quoteLength: "short" }));
    store.dispatch(loadWords({ count: 5 }));
    expect(store.getState().paragraph).toMatchObject({ quoteLength: null, source: null });
    store.dispatch(refreshWords());
    expect(store.getState().paragraph.wordsCollection).toHaveLength(5);
  });
});

const VALID_STAT = { id: 1, user: "Anonymous", words_per_minute: 60, characters_per_minute: 300, accuracy: 95 };

describe("stat thunks", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("getStatCall stores the response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [VALID_STAT] }));
    const store = makeStore();
    await store.dispatch(getStatCall());
    expect(store.getState().globalStats.status).toBe("Stats Received");
    expect(store.getState().globalStats.stats).toEqual([VALID_STAT]);
  });
  it("getStatCall rejects on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const store = makeStore();
    await store.dispatch(getStatCall());
    expect(store.getState().globalStats.status).toBe("Stats API Failed");
  });
  it("addStatCall posts the stat and records success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    const store = makeStore();
    await store.dispatch(addStatCall({ user: "Anonymous", words: 40, chars: 200, accuracy: 95 }));
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(store.getState().globalStats.status).toBe("Stat Saved");
  });
  it("addStatCall records failure on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400 }));
    const store = makeStore();
    await store.dispatch(addStatCall({ user: "Anonymous", words: 1, chars: 1, accuracy: 1 }));
    expect(store.getState().globalStats.status).toBe("Save Failed");
  });
});

describe("paragraph slice options", () => {
  it("loadWords stores punctuation/numbers and refreshWords reuses them", () => {
    const store = makeStore();
    store.dispatch(loadWords({ count: 7, mode: "hard", punctuation: true, numbers: true }));
    expect(store.getState().paragraph.options).toEqual({ punctuation: true, numbers: true });
    vi.mocked(getWords).mockClear();
    store.dispatch(refreshWords());
    expect(getWords).toHaveBeenCalledWith(7, "hard", { punctuation: true, numbers: true });
  });
});

describe("paragraph round / repeatWords", () => {
  it("repeatWords keeps the words and bumps the round", () => {
    const store = makeStore();
    store.dispatch(loadWords({ count: 5 }));
    const { wordsCollection, round } = store.getState().paragraph;
    store.dispatch(repeatWords());
    expect(store.getState().paragraph.wordsCollection).toBe(wordsCollection);
    expect(store.getState().paragraph.round).toBe(round + 1);
  });
  it("loadWords and refreshWords also start a new round", () => {
    const store = makeStore();
    store.dispatch(loadWords({ count: 5 }));
    const r = store.getState().paragraph.round;
    store.dispatch(refreshWords());
    expect(store.getState().paragraph.round).toBe(r + 1);
  });
});
