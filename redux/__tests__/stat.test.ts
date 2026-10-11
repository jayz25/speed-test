import { configureStore } from "@reduxjs/toolkit";
import reducer, { getStatCall } from "../stat";

const valid = { id: 1, user: "a", words_per_minute: 50, characters_per_minute: 250, accuracy: 95 };

const makeStore = () => configureStore({ reducer: { globalStats: reducer } });

const mockFetch = (res: Partial<Response>) => {
  const fn = vi.fn().mockResolvedValue(res);
  vi.stubGlobal("fetch", fn);
  return fn;
};

describe("getStatCall", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("filters invalid rows out of the response", async () => {
    mockFetch({ ok: true, json: async () => [valid, { id: "x" }, null] });
    const store = makeStore();
    await store.dispatch(getStatCall());
    expect(store.getState().globalStats.stats).toEqual([valid]);
    expect(store.getState().globalStats.status).toBe("Stats Received");
  });

  it("rejects when the body is not an array", async () => {
    mockFetch({ ok: true, json: async () => ({ rows: [] }) });
    const store = makeStore();
    const result = await store.dispatch(getStatCall());
    expect(result.type).toBe("stats/getStats/rejected");
    expect(store.getState().globalStats.status).toBe("Stats API Failed");
  });

  it("rejects on HTTP 500", async () => {
    mockFetch({ ok: false, status: 500 });
    const store = makeStore();
    const result = await store.dispatch(getStatCall());
    expect(result.type).toBe("stats/getStats/rejected");
    expect(store.getState().globalStats.status).toBe("Stats API Failed");
  });

  it("passes an AbortSignal to fetch and does not mark aborted requests as failed", async () => {
    const fetchMock = vi.fn((_url: string, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    const store = makeStore();
    const request = store.dispatch(getStatCall());
    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
    request.abort();
    await request;
    expect(store.getState().globalStats.status).not.toBe("Stats API Failed");
  });
});
