import { expect, test } from "@playwright/test";
import { nextTestButton, openTest, readWord, readWords, RUN_END_TIMEOUT_MS, runToResult, selectShortRun, timerLabel, words } from "./helpers";

const NEW_WORDS_PREVIEW = 10;

test.describe("typing flow", () => {
  test("loads with a caret and accepts typing without clicking first", async ({ page }) => {
    await openTest(page);
    await expect(page.locator('[data-word] [data-caret="before"]').first()).toBeVisible();
    await expect(page.locator("[data-caret-bar]")).toBeVisible();

    const first = await readWord(page, 0);
    await page.keyboard.type(first[0]);
    await expect(words(page).nth(0).locator("span").first()).toHaveClass(/\btext-ink\b/);
  });

  test("correct word advances, wrong word is underlined, backspace respects word start", async ({ page }) => {
    await openTest(page);

    await page.keyboard.type(await readWord(page, 0));
    await page.keyboard.press("Space");
    await expect(words(page).nth(0)).not.toHaveClass(/underline/);
    await expect(words(page).nth(1).locator("span").first()).toHaveAttribute("data-caret", "before");

    await page.keyboard.type("~~");
    await page.keyboard.press("Space");
    await expect(words(page).nth(1)).toHaveClass(/underline/);
    await expect(words(page).nth(2).locator("span").first()).toHaveAttribute("data-caret", "before");

    // Backspace at a word start does nothing: still on word 2, word 1 still wrong.
    await page.keyboard.press("Backspace");
    await expect(words(page).nth(2).locator("span").first()).toHaveAttribute("data-caret", "before");
    await expect(words(page).nth(1)).toHaveClass(/underline/);

    // Backspace inside a word removes the typed letter.
    const target = await readWord(page, 2);
    const wrongChar = target[0] === "q" ? "z" : "q";
    const firstLetter = words(page).nth(2).locator("span").first();
    await page.keyboard.type(wrongChar);
    await expect(firstLetter).toHaveClass(/\btext-error\b/);
    await page.keyboard.press("Backspace");
    await expect(firstLetter).toHaveClass(/\btext-pending\b/);
  });

  test("timer starts on first keystroke, run ends with the result card, Enter starts a new test", async ({ page }) => {
    await openTest(page);
    await selectShortRun(page);
    const before = await readWords(page, NEW_WORDS_PREVIEW);

    await page.keyboard.type((await readWord(page, 0))[0]);
    await expect(timerLabel(page)).not.toHaveText("0:15");
    await expect(nextTestButton(page)).toBeVisible({ timeout: RUN_END_TIMEOUT_MS });

    await page.keyboard.press("Enter");
    await expect(nextTestButton(page)).toBeHidden();
    await expect(timerLabel(page)).toHaveText("0:15");
    expect(await readWords(page, NEW_WORDS_PREVIEW)).not.toBe(before);
  });

  test("Next test button on the result card starts a new test with new words", async ({ page }) => {
    await openTest(page);
    await selectShortRun(page);
    const before = await readWords(page, NEW_WORDS_PREVIEW);
    await runToResult(page);

    await nextTestButton(page).click();
    await expect(nextTestButton(page)).toBeHidden();
    await expect(words(page).first()).toBeVisible();
    expect(await readWords(page, NEW_WORDS_PREVIEW)).not.toBe(before);
  });
});
