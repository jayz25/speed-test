import { makeStore } from "../store";
import settingsReducer, { DEFAULT_SETTINGS, hydrateSettings, sanitizeSettings, setSetting } from "../settings";
import { loadStoredSettings, startSettingsPersistence } from "../persistSettings";
import { SETTINGS_KEY } from "../../utils/storage";

describe("settings slice", () => {
  it("has documented defaults", () => {
    expect(DEFAULT_SETTINGS).toEqual({
      mode: "time", timeLimit: 30, wordCount: 25, difficulty: "mixed",
      punctuation: false, numbers: false, playerName: "",
    });
    expect(settingsReducer(undefined, { type: "init" })).toEqual(DEFAULT_SETTINGS);
  });

  it("setSetting merges a partial update", () => {
    const next = settingsReducer(DEFAULT_SETTINGS, setSetting({ mode: "words", wordCount: 50 }));
    expect(next).toEqual({ ...DEFAULT_SETTINGS, mode: "words", wordCount: 50 });
  });

  it("hydrateSettings replaces the state", () => {
    const hydrated = { ...DEFAULT_SETTINGS, timeLimit: 120 as const, playerName: "Ann" };
    expect(settingsReducer(DEFAULT_SETTINGS, hydrateSettings(hydrated))).toEqual(hydrated);
  });
});

describe("sanitizeSettings", () => {
  it("returns defaults for non-objects", () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings("x")).toEqual(DEFAULT_SETTINGS);
  });
  it("keeps valid fields and falls back per field", () => {
    const out = sanitizeSettings({ mode: "words", timeLimit: 45, wordCount: 100, difficulty: "nope", punctuation: true, numbers: "yes", playerName: "Bo" });
    expect(out).toEqual({ ...DEFAULT_SETTINGS, mode: "words", wordCount: 100, punctuation: true, playerName: "Bo" });
  });
  it("preserves a legacy { playerName } only record", () => {
    expect(sanitizeSettings({ playerName: "Legacy" })).toEqual({ ...DEFAULT_SETTINGS, playerName: "Legacy" });
  });
});

describe("settings persistence", () => {
  beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
  afterEach(() => vi.useRealTimers());

  it("loads defaults when storage is empty and sanitizes stored values", () => {
    expect(loadStoredSettings()).toEqual(DEFAULT_SETTINGS);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ playerName: "Z", timeLimit: 60 }));
    expect(loadStoredSettings()).toEqual({ ...DEFAULT_SETTINGS, playerName: "Z", timeLimit: 60 });
  });

  it("debounces writes by 300ms and only on settings changes", () => {
    const store = makeStore();
    const stop = startSettingsPersistence(store);
    store.dispatch(setSetting({ timeLimit: 60 }));
    store.dispatch(setSetting({ difficulty: "easy" }));
    vi.advanceTimersByTime(299);
    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull();
    vi.advanceTimersByTime(1);
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)!)).toEqual({ ...DEFAULT_SETTINGS, timeLimit: 60, difficulty: "easy" });
    stop();
  });

  it("does not write after unsubscribe", () => {
    const store = makeStore();
    const stop = startSettingsPersistence(store);
    store.dispatch(setSetting({ numbers: true }));
    stop();
    vi.advanceTimersByTime(1000);
    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull();
  });

  it("flushes pending writes on pagehide", () => {
    const store = makeStore();
    const stop = startSettingsPersistence(store);
    store.dispatch(setSetting({ punctuation: true }));
    window.dispatchEvent(new Event("pagehide"));
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)!).punctuation).toBe(true);
    stop();
  });
});
