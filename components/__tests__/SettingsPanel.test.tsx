import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import SettingsPanel from "../SettingsPanel";
import { makeStore } from "../../redux/store";

const setup = (isDimmed = false) => {
  const store = makeStore();
  render(<Provider store={store}><SettingsPanel isDimmed={isDimmed} /></Provider>);
  return { store, user: userEvent.setup() };
};

describe("SettingsPanel", () => {
  it("dims only when requested", () => {
    setup(true);
    expect(screen.getByRole("complementary", { name: "Test settings" })).toHaveClass("opacity-55");
  });

  it("is not dimmed by default", () => {
    setup();
    expect(screen.getByRole("complementary", { name: "Test settings" })).not.toHaveClass("opacity-55");
  });

  it("shows durations by default and updates the time limit with aria-pressed", async () => {
    const { store, user } = setup();
    expect(screen.getByRole("button", { name: "30" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "25" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "120" }));
    expect(store.getState().settings.timeLimit).toBe(120);
    expect(screen.getByRole("button", { name: "120" })).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the chosen size when the active mode is clicked again", async () => {
    const { store, user } = setup();
    await user.click(screen.getByRole("button", { name: "60" }));
    await user.click(screen.getByRole("button", { name: "Time" }));
    expect(store.getState().settings.timeLimit).toBe(60);
  });

  it("switches to word lengths and resets size to the mode default", async () => {
    const { store, user } = setup();
    await user.click(screen.getByRole("button", { name: "120" }));
    await user.click(screen.getByRole("button", { name: "Words" }));
    expect(store.getState().settings).toMatchObject({ mode: "words", wordCount: 25 });
    await user.click(screen.getByRole("button", { name: "50" }));
    expect(store.getState().settings.wordCount).toBe(50);
    await user.click(screen.getByRole("button", { name: "Time" }));
    expect(store.getState().settings).toMatchObject({ mode: "time", timeLimit: 30 });
  });

  it("changes difficulty and toggles punctuation and numbers", async () => {
    const { store, user } = setup();
    await user.click(screen.getByRole("button", { name: "Hard" }));
    await user.click(screen.getByRole("checkbox", { name: "Punctuation" }));
    await user.click(screen.getByRole("checkbox", { name: "Numbers" }));
    expect(store.getState().settings).toMatchObject({ difficulty: "hard", punctuation: true, numbers: true });
    expect(screen.getByRole("checkbox", { name: "Numbers" })).toBeChecked();
  });
});
