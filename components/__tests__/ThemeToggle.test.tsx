import { fireEvent, render, screen } from "@testing-library/react";
import ThemeToggle from "../ThemeToggle";
import { THEME_ATTR, resetThemeStoreForTests } from "../../utils/theme";
import { THEME_KEY } from "../../utils/storage";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTR);
    resetThemeStoreForTests();
  });

  it("starts on system and cycles through light and dark", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /theme: system/i });

    fireEvent.click(button);
    expect(screen.getByRole("button", { name: /theme: light/i })).toBeInTheDocument();
    expect(document.documentElement.getAttribute(THEME_ATTR)).toBe("light");

    fireEvent.click(button);
    expect(screen.getByRole("button", { name: /theme: dark/i })).toBeInTheDocument();
    expect(localStorage.getItem(THEME_KEY)).toBe('"dark"');

    fireEvent.click(button);
    expect(screen.getByRole("button", { name: /theme: system/i })).toBeInTheDocument();
    expect(document.documentElement.hasAttribute(THEME_ATTR)).toBe(false);
  });

  it("shows the stored preference", () => {
    localStorage.setItem(THEME_KEY, '"dark"');
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /theme: dark/i })).toBeInTheDocument();
  });
});
