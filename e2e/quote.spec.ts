import { expect, test } from "@playwright/test";
import { nextTestButton, openTest, readWords, RUN_END_TIMEOUT_MS, words } from "./helpers";

const SOURCE_LINE = /^— .+/;

test.describe("quote mode", () => {
  test("typing a whole short quote finishes the test and shows the source on the result", async ({ page }) => {
    await openTest(page);
    await page.getByRole("group", { name: "Test mode" }).getByRole("button", { name: "Quote", exact: true }).click();
    await page.getByRole("group", { name: "Quote length" }).getByRole("button", { name: "Short", exact: true }).click();

    // Quote mode swaps the controls: no difficulty or include toggles, a words-style progress label.
    await expect(page.getByRole("group", { name: "Difficulty" })).toHaveCount(0);
    await expect(page.getByRole("checkbox", { name: "Punctuation" })).toHaveCount(0);
    await expect(page.getByText(/^0\/\d+$/)).toBeVisible();

    const source = page.locator("p").filter({ hasText: SOURCE_LINE });
    await expect(source).toBeVisible();
    const sourceText = (await source.textContent()) ?? "";

    const quote = await readWords(page, await words(page).count());
    expect(quote.split(" ").length).toBeLessThanOrEqual(20);
    await page.keyboard.type(quote);

    await expect(nextTestButton(page)).toBeVisible({ timeout: RUN_END_TIMEOUT_MS });
    await expect(page.getByText("quote · short")).toBeVisible();
    await expect(page.getByText(sourceText, { exact: true })).toBeVisible();
  });
});
