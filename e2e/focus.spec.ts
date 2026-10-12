import { expect, test } from "@playwright/test";
import { openTest, readWord, words } from "./helpers";

test("clicking outside shows the focus overlay; clicking it resumes typing", async ({ page }) => {
  await openTest(page);
  const overlay = page.getByText("Click here to start typing");
  await expect(overlay).toBeHidden();

  // A non-interactive label outside the typing area; moves focus off the hidden input.
  await page.getByText("Duration (seconds)").click();
  await expect(overlay).toBeVisible();

  // The hidden input is stretched over the words box, so this is where a user's click lands.
  await page.getByLabel("Type the words shown").click();
  await expect(overlay).toBeHidden();

  await page.keyboard.type((await readWord(page, 0))[0]);
  await expect(words(page).first().locator("span").first()).toHaveClass(/\btext-ink\b/);
});
