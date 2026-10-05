import { test, expect } from "@playwright/test";

for (const path of ["/admin/dashboard", "/admin/editor", "/admin/resources"]) {
  test(`unauthenticated access redirects: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("button", { name: "Sign In", exact: true })).toBeVisible();
  });
}

test("demo credentials no longer authenticate", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill("admin@smartmoneybook.demo");
  await page.getByLabel("Password", { exact: true }).fill("SmartMoney2026!");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page.locator(".admin-error[role=alert]")).toContainText(/Invalid login credentials/i);
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("signup rejects any other email without creating an account", async ({ page }) => {
  await page.goto("/admin/sign-up");
  await page.getByLabel("Your name").fill("Verification");
  await page.getByLabel("Email address").fill("unauthorized@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Verification-password-123!");
  await page.getByRole("button", { name: "Create Account", exact: true }).click();
  await expect(page.locator(".admin-error[role=alert]")).toContainText("Registration is restricted");
});

test("approved administrator publishes globally and removes the test post", async ({ page, browser }) => {
  test.skip(!process.env.SMB_TEST_ADMIN_PASSWORD, "Requires the owner-created, verified, approved account.");
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill("tafartechlabs@gmail.com");
  await page.getByLabel("Password", { exact: true }).fill(process.env.SMB_TEST_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  const title = `E2E verification ${crypto.randomUUID()}`;
  await page.goto("/admin/editor");
  await page.getByLabel("Post title", { exact: true }).fill(title);
  await page.getByLabel("Post summary").fill("Temporary verification post.");
  await page.getByRole("textbox", { name: "Article content", exact: true }).fill("Shared live content verification.");
  await page.getByRole("button", { name: "Save Draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved to the library");
  await page.reload();
  await expect(page.getByLabel("Post title", { exact: true })).toHaveValue(title);
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("radio", { name: /Blog post/ }).check();
  await page.getByRole("button", { name: "Publish to Website" }).click();
  await expect(page.getByRole("status")).toContainText("Published");
  const context = await browser.newContext();
  const reader = await context.newPage();
  await reader.goto("http://localhost:3000/blog");
  await expect(reader.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await context.close();
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: `Delete ${title}`, exact: true }).click();
  await page.getByRole("button", { name: "Delete Post", exact: true }).click();
  await expect(page.getByRole("cell", { name: title, exact: true })).toHaveCount(0);
});
