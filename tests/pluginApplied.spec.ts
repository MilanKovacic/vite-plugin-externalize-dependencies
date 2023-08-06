import { test, expect } from "@playwright/test";

test("should render correctly when plugin is enabled", async ({ page }) => {
  await page.goto("http://localhost:3001");
  await expect(
    page.getByText("Message from logger.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Failed to resolve import "customLogger"'),
  ).not.toBeVisible();
});
