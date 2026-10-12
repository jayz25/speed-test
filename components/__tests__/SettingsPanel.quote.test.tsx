import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import SettingsPanel from "../SettingsPanel";
import { makeStore } from "../../redux/store";

const setup = () => {
  const store = makeStore();
  render(<Provider store={store}><SettingsPanel isDimmed={false} /></Provider>);
  return { store, user: userEvent.setup() };
};

describe("SettingsPanel quote mode", () => {
  it("offers Quote as a third mode and defaults to the medium length", async () => {
    const { store, user } = setup();
    await user.click(screen.getByRole("button", { name: "Quote" }));
    expect(store.getState().settings.mode).toBe("quote");
    expect(screen.getByRole("button", { name: "Medium" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the Short/Medium/Long group in place of duration and word count", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Quote" }));
    const group = screen.getByRole("group", { name: "Quote length" });
    expect(within(group).getAllByRole("button").map((b) => b.textContent)).toEqual(["Short", "Medium", "Long"]);
    expect(screen.queryByRole("group", { name: "Time limit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Word count" })).not.toBeInTheDocument();
  });

  it("hides difficulty, punctuation and numbers", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Quote" }));
    expect(screen.queryByRole("group", { name: "Difficulty" })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Punctuation" })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Numbers" })).not.toBeInTheDocument();
  });

  it("updates the quote length with aria-pressed", async () => {
    const { store, user } = setup();
    await user.click(screen.getByRole("button", { name: "Quote" }));
    await user.click(screen.getByRole("button", { name: "Long" }));
    expect(store.getState().settings.quoteLength).toBe("long");
    expect(screen.getByRole("button", { name: "Long" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Medium" })).toHaveAttribute("aria-pressed", "false");
  });

  it("brings the time controls back when leaving quote mode", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Quote" }));
    await user.click(screen.getByRole("button", { name: "Time" }));
    expect(screen.getByRole("group", { name: "Time limit" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Difficulty" })).toBeInTheDocument();
  });
});
