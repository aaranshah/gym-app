import { expect, test } from "@playwright/test";

const SAMPLE =
  "It is important to note that the new policy plays a crucial role in improving efficiency. Furthermore, it will reduce paperwork by 30%. Moreover, approvals will be faster.";

test("mobile: tabbed layout, no horizontal overflow, auto-switch to result", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("tab-input")).toBeVisible();
  await expect(page.getByTestId("input-text")).toBeVisible();
  await expect(page.locator('section[aria-label="Humanised text"]')).toBeHidden();

  await page.getByTestId("input-text").fill(SAMPLE);
  await page.getByTestId("humanise-button").click();
  await expect(page.getByTestId("output-text")).toBeVisible();
  await expect(page.getByTestId("tab-output")).toHaveAttribute("aria-selected", "true");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  // All primary actions reachable on a phone.
  for (const id of ["copy-button", "alternative-button", "again-button", "clear-output", "fidelity-badge"]) {
    await expect(page.getByTestId(id)).toBeVisible();
  }
  await page.getByTestId("tab-input").click();
  await expect(page.getByTestId("input-text")).toHaveValue(SAMPLE);

  // Options panel fits within the viewport.
  await page.getByTestId("options-button").click();
  const box = await page.getByTestId("options-panel").boundingBox();
  const vw = page.viewportSize()!.width;
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(vw);
});
