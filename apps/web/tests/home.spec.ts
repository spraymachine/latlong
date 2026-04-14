import { test, expect } from "playwright/test";

test("homepage renders the LatLong shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /latlong/i })).toBeVisible();
  await expect(page.getByText(/shared ocean map/i)).toBeVisible();
});
