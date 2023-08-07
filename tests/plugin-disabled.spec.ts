import { test, expect } from "@playwright/test";

test("should fail when plugin is disabled", async ({ page }) => {
  await page.goto("http://localhost:3002");
  await expect(
    page.getByText("Message from logger.", { exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByText('Failed to resolve import "custom-logger"'),
  ).toBeVisible();
});
