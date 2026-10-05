import { makeStore } from "../store";
import { loadWords, refreshWords } from "../paragraph";
import { addStatCall, getStatCall } from "../stat";

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
  it("refreshWords falls back to 60 when empty", () => {
    const store = makeStore();
    store.dispatch(refreshWords());
    expect(store.getState().paragraph.wordsCollection).toHaveLength(60);
  });
});

describe("stat thunks", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("getStatCall stores the response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 1 }] }));
    const store = makeStore();
    await store.dispatch(getStatCall());
    expect(store.getState().globalStats.status).toBe("Stats Received");
    expect(store.getState().globalStats.stats).toEqual([{ id: 1 }]);
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
