import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import YourResults from "../YourResults";
import { HISTORY_KEY } from "../../utils/storage";
import type { HistoryEntry } from "../../utils/history";

const run = (o: Partial<HistoryEntry>): HistoryEntry => ({
  id: Math.random().toString(), date: "2026-01-01T10:00:00.000Z", mode: "time", limit: 30, difficulty: "mixed",
  wpm: 50, rawWpm: 55, accuracy: 95, ...o,
});
const seed = (entries: HistoryEntry[]) => localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));

describe("YourResults", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("shows the empty state linking to the test page", async () => {
    render(<YourResults />);
    const link = await screen.findByRole("link", { name: "take one" });
    expect(link).toHaveAttribute("href", "/");
    expect(screen.getByText(/No tests yet/)).toBeInTheDocument();
  });

  it("shows averages, personal bests and recent runs as accessible tables", async () => {
    seed([run({ wpm: 40, accuracy: 90 }), run({ wpm: 60, accuracy: 100 }), run({ wpm: 80, mode: "words", limit: 25, difficulty: "hard" })]);
    render(<YourResults />);
    expect(await screen.findByText("Average WPM")).toBeInTheDocument();
    expect(screen.getByText("60", { selector: "dd" })).toBeInTheDocument();

    const [pbTable, recentTable] = screen.getAllByRole("table");
    expect(within(pbTable).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Test", "Best WPM", "Accuracy", "Runs"]);
    expect(within(pbTable).getByRole("rowheader", { name: "30s mixed" })).toBeInTheDocument();
    expect(within(pbTable).getByRole("rowheader", { name: "25 words hard" })).toBeInTheDocument();
    expect(within(recentTable).getAllByRole("row")).toHaveLength(4); // header + 3
    expect(screen.getByRole("heading", { name: "Personal bests" })).toBeInTheDocument();
  });

  it("limits recent runs to 20, newest first", async () => {
    seed(Array.from({ length: 30 }, (_, i) => run({ id: String(i), wpm: i })));
    render(<YourResults />);
    const recent = (await screen.findAllByRole("table"))[1];
    const rows = within(recent).getAllByRole("row");
    expect(rows).toHaveLength(21);
    expect(within(rows[1]).getByText("29")).toBeInTheDocument();
  });

  it("clears history only after confirmation", async () => {
    seed([run({})]);
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<YourResults />);
    await user.click(await screen.findByRole("button", { name: "Clear history" }));
    expect(screen.getAllByRole("table")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Clear history" }));
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(await screen.findByText(/No tests yet/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)).toEqual([]);
  });
});
