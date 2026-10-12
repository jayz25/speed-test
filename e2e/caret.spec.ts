import { expect, Page, test } from "@playwright/test";
import { openTest, readWord, words } from "./helpers";

const caretBar = (page: Page) => page.locator("[data-caret-bar]");
const caretX = (page: Page) =>
  caretBar(page).evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);

test.describe("caret", () => {
  test.use({ reducedMotion: "no-preference" });

  test("glides to the next letter on each keystroke and sits on the caret letter", async ({ page }) => {
    await openTest(page);
    const startX = await caretX(page);
    await page.keyboard.type((await readWord(page, 0))[0]);

    await expect(caretBar(page)).toHaveAttribute("data-animate", "true");
    expect(await caretBar(page).evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0.12s");
    // After the transition settles the bar sits at the left edge of the caret letter
    await expect.poll(async () => {
      const [bar, letter] = await Promise.all([
        caretBar(page).boundingBox(),
        page.locator('[data-word] [data-caret="before"]').first().boundingBox(),
      ]);
      return bar && letter ? Math.round(Math.abs(bar.x - letter.x)) : -1;
    }).toBeLessThanOrEqual(1);
    expect(await caretX(page)).toBeGreaterThan(startX);
  });

  test("jumps without animating when a new test starts", async ({ page }) => {
    await openTest(page);
    await page.keyboard.type((await readWord(page, 0)) + " ");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(words(page).first().locator("span").first()).toHaveAttribute("data-caret", "before");
    await expect(caretBar(page)).toHaveAttribute("data-animate", "false");
  });

  test("blinks only while waiting for the first keystroke", async ({ page }) => {
    await openTest(page);
    expect(await caretBar(page).evaluate((el) => getComputedStyle(el).animationName)).toBe("caret-blink");
    await page.keyboard.type((await readWord(page, 0))[0]);
    await expect.poll(() => caretBar(page).evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  });
});

test.describe("caret with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("moves without a transition or blink", async ({ page }) => {
    await openTest(page);
    expect(await caretBar(page).evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    await page.keyboard.type((await readWord(page, 0))[0]);
    await expect(caretBar(page)).toHaveAttribute("data-animate", "true");
    expect(await caretBar(page).evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
  });
});
