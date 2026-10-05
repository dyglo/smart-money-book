import { test, expect } from "@playwright/test";

test("public routes, live empty library, search, and responsive layout", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const path of ["/", "/blog", "/tutorials", "/market-structure", "/books", "/resources"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Sample PDF");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole("searchbox", { name: "Search resources" }).fill("no-such-resource");
  await expect(page.getByRole("heading", { name: "No resources found" })).toBeVisible();
  await page.getByRole("button", { name: "Clear Filters" }).click();
  expect(errors).toEqual([]);
});

test("unknown tutorial returns 404", async ({ page }) => {
  const response = await page.goto("/tutorials/unknown-verification-slug");
  expect(response?.status()).toBe(404);
});

test("published database fixture is shared across independent browsers", async ({ page, browser }) => {
  test.skip(!process.env.SMB_TEST_PUBLIC_SLUG, "Requires a temporary published Supabase fixture.");
  const path = `/tutorials/${process.env.SMB_TEST_PUBLIC_SLUG}`;
  await page.goto(path);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Backend browser verification");
  await page.getByLabel("Comment *").fill("Browser persistence verification.");
  await page.getByLabel("Name *", { exact: true }).fill(`Reader ${test.info().project.name}`);
  await page.getByRole("button", { name: "Post Comment", exact: true }).click();
  await expect(page.locator(".comments")).toContainText(`Reader ${test.info().project.name}`);
  await page.reload();
  await expect(page.locator(".comments")).toContainText(`Reader ${test.info().project.name}`);
  const context = await browser.newContext();
  const reader = await context.newPage();
  await reader.goto(page.url());
  await expect(reader.getByRole("heading", { level: 1 })).toHaveText("Backend browser verification");
  await expect(reader.locator(".comments")).toContainText(`Reader ${test.info().project.name}`);
  await context.close();
});
