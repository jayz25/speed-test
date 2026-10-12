import { expect, test } from "@playwright/test";
import { chooseDuration, openTest, timerLabel } from "./helpers";

const DURATIONS = [
  { seconds: 15, label: "0:15" },
  { seconds: 30, label: "0:30" },
  { seconds: 60, label: "1:00" },
  { seconds: 120, label: "2:00" },
];

test("changing the duration before starting is reflected in the timer", async ({ page }) => {
  await openTest(page);
  for (const { seconds, label } of DURATIONS) {
    await chooseDuration(page, seconds);
    await expect(timerLabel(page)).toHaveText(label);
  }
});
