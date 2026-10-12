import {
  THEME_ATTR, THEME_INIT_SCRIPT, applyThemePreference, getThemePreference, isThemePreference,
  nextThemePreference, resetThemeStoreForTests, setThemePreference, subscribeTheme,
} from "../theme";
import { THEME_KEY } from "../storage";

describe("theme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTR);
    resetThemeStoreForTests();
  });

  it("validates preferences", () => {
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("blue")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });

  it("cycles system -> light -> dark -> system", () => {
    expect(nextThemePreference("system")).toBe("light");
    expect(nextThemePreference("light")).toBe("dark");
    expect(nextThemePreference("dark")).toBe("system");
  });

  it("defaults to system and ignores invalid stored values", () => {
    expect(getThemePreference()).toBe("system");
    localStorage.setItem(THEME_KEY, '"neon"');
    resetThemeStoreForTests();
    expect(getThemePreference()).toBe("system");
  });

  it("reads a stored preference", () => {
    localStorage.setItem(THEME_KEY, '"dark"');
    expect(getThemePreference()).toBe("dark");
  });

  it("applies the attribute only for explicit themes", () => {
    const root = document.documentElement;
    applyThemePreference("dark", root);
    expect(root.getAttribute(THEME_ATTR)).toBe("dark");
    applyThemePreference("system", root);
    expect(root.hasAttribute(THEME_ATTR)).toBe(false);
  });

  it("persists, applies and notifies on set", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);
    setThemePreference("light");
    expect(getThemePreference()).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe('"light"');
    expect(document.documentElement.getAttribute(THEME_ATTR)).toBe("light");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    setThemePreference("dark");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("init script applies a stored explicit theme and tolerates garbage", () => {
    localStorage.setItem(THEME_KEY, '"dark"');
    new Function(THEME_INIT_SCRIPT)();
    expect(document.documentElement.getAttribute(THEME_ATTR)).toBe("dark");

    document.documentElement.removeAttribute(THEME_ATTR);
    localStorage.setItem(THEME_KEY, "{oops");
    expect(() => new Function(THEME_INIT_SCRIPT)()).not.toThrow();
    expect(document.documentElement.hasAttribute(THEME_ATTR)).toBe(false);
  });
});
