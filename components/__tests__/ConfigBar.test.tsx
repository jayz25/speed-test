import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import ConfigBar from "../ConfigBar";
import { makeStore } from "../../redux/store";

const setup = () => {
  const store = makeStore();
  const { container } = render(<Provider store={store}><ConfigBar /></Provider>);
  return { store, container, user: userEvent.setup() };
};

describe("ConfigBar", () => {
  it("is marked to fade in focus mode", () => {
    const { container } = setup();
    expect(container.firstElementChild).toHaveAttribute("data-focus-fade");
  });

  it("shows time options by default and updates the time limit", async () => {
    const { store, user } = setup();
    expect(screen.getByRole("button", { name: "30s" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "25" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "120s" }));
    expect(store.getState().settings.timeLimit).toBe(120);
  });

  it("switches to word counts in words mode", async () => {
    const { store, user } = setup();
    await user.click(screen.getByRole("button", { name: "words" }));
    expect(store.getState().settings.mode).toBe("words");
    expect(screen.queryByRole("button", { name: "30s" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "50" }));
    expect(store.getState().settings.wordCount).toBe(50);
  });

  it("changes difficulty and toggles punctuation and numbers", async () => {
    const { store, user } = setup();
    await user.click(screen.getByRole("button", { name: "hard" }));
    await user.click(screen.getByRole("button", { name: "@ punctuation" }));
    await user.click(screen.getByRole("button", { name: "# numbers" }));
    expect(store.getState().settings).toMatchObject({ difficulty: "hard", punctuation: true, numbers: true });
    expect(screen.getByRole("button", { name: "# numbers" })).toHaveAttribute("aria-pressed", "true");
  });
});
