import { expect, test } from "@playwright/test";
import { openTest } from "./helpers";

const bodyBackground = (page: import("@playwright/test").Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe("theme", () => {
  test.use({ colorScheme: "light" });

  test("follows the OS by default, and the toggle cycles light, dark and back to system", async ({ page }) => {
    await openTest(page);
    const html = page.locator("html");
    await expect(html).not.toHaveAttribute("data-theme", /.+/);
    const lightBackground = await bodyBackground(page);

    await page.getByRole("button", { name: /^Theme: system/ }).click();
    await expect(html).toHaveAttribute("data-theme", "light");

    await page.getByRole("button", { name: /^Theme: light/ }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    expect(await bodyBackground(page)).not.toBe(lightBackground);

    await page.getByRole("button", { name: /^Theme: dark/ }).click();
    await expect(html).not.toHaveAttribute("data-theme", /.+/);
    expect(await bodyBackground(page)).toBe(lightBackground);
  });

  test("an explicit choice survives a reload and is applied before hydration", async ({ page }) => {
    await openTest(page);
    await page.getByRole("button", { name: /^Theme: system/ }).click();
    await page.getByRole("button", { name: /^Theme: light/ }).click();

    // Record data-theme at DOMContentLoaded, i.e. from the inline head script, not React
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        (window as unknown as { themeAtLoad: string | null }).themeAtLoad =
          document.documentElement.getAttribute("data-theme");
      });
    });
    await page.reload();
    expect(await page.evaluate(() => (window as unknown as { themeAtLoad: string | null }).themeAtLoad)).toBe("dark");
    await expect(page.getByRole("button", { name: /^Theme: dark/ })).toBeVisible();
  });
});

test.describe("theme with a dark OS", () => {
  test.use({ colorScheme: "dark" });

  test("uses the dark palette without any stored choice", async ({ page }) => {
    await openTest(page);
    const background = await bodyBackground(page);
    await page.getByRole("button", { name: /^Theme: system/ }).click(); // -> light
    expect(await bodyBackground(page)).not.toBe(background);
  });
});
