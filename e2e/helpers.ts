import { expect, Locator, Page } from "@playwright/test";

/** Short enough for 15s runs to finish well inside the test timeout. */
export const SHORT_RUN_SECONDS = 15;
export const RUN_END_TIMEOUT_MS = (SHORT_RUN_SECONDS + 10) * 1000;

/** Words are shuffled per run, so tests always read them from the DOM. */
export const words = (page: Page): Locator => page.locator("[data-word]");

export async function openTest(page: Page): Promise<void> {
  await page.goto("/");
  await expect(words(page).first()).toBeVisible();
}

export async function readWord(page: Page, index: number): Promise<string> {
  return (await words(page).nth(index).textContent()) ?? "";
}

export async function readWords(page: Page, count: number): Promise<string> {
  const texts: string[] = [];
  for (let i = 0; i < count; i++) texts.push(await readWord(page, i));
  return texts.join(" ");
}

export const timerLabel = (page: Page): Locator => page.getByText(/^\d:\d{2}$/);

export const nextTestButton = (page: Page): Locator => page.getByRole("button", { name: "Next test" });

export async function chooseDuration(page: Page, seconds: number): Promise<void> {
  await page.getByRole("group", { name: "Time limit" }).getByRole("button", { name: String(seconds), exact: true }).click();
}

/** Selects the 15s duration and waits for the timer to show it. */
export async function selectShortRun(page: Page): Promise<void> {
  await chooseDuration(page, SHORT_RUN_SECONDS);
  await expect(timerLabel(page)).toHaveText("0:15");
}

/** Types one correct letter to start the timer, then waits for the result card. */
export async function runToResult(page: Page): Promise<void> {
  await page.keyboard.type((await readWord(page, 0))[0]);
  await expect(nextTestButton(page)).toBeVisible({ timeout: RUN_END_TIMEOUT_MS });
}
