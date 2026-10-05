import { test, expect } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";

test("auth pages do not disclose the administrator email", async ({ page }) => {
  for (const route of ["/admin/login", "/admin/sign-up"]) {
    await page.goto(route);
    await expect(page.locator(".demo-credentials")).toHaveCount(0);
    await expect(page.locator(".auth-disclosure")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("tafartechlabs@gmail.com");
  }
});

test("visitor requests execute, repeat views get new IDs, admin routes are excluded", async ({ page }) => {
  const events: Record<string, string>[] = [];
  page.on("request", request => {
    if (request.url().includes("/rest/v1/rpc/record_page_view")) events.push(request.postDataJSON());
  });
  const nextView = () => page.waitForResponse(response => response.url().includes("/rest/v1/rpc/record_page_view") && response.ok());
  let response = nextView();
  await page.goto("/");
  await response;
  response = nextView();
  await page.reload();
  await response;
  expect(events).toHaveLength(2);
  expect(events[0].p_visitor).toBe(events[1].p_visitor);
  expect(events[0].p_event).not.toBe(events[1].p_event);
  await page.goto("/admin/login");
  await expect(page.getByRole("button", { name: "Sign In", exact: true })).toBeVisible();
  expect(events).toHaveLength(2);
  response = nextView();
  await page.goto("/resources?q=analytics");
  await response;
  expect(events[2].p_path).toBe("/resources");
  mkdirSync("test-results", { recursive: true });
  writeFileSync(`test-results/analytics-${test.info().project.name}.json`, JSON.stringify(events));
});

test("post view tracking follows post IDs when only the query string changes", async ({ page }) => {
  test.skip(!process.env.SMB_TEST_ANALYTICS_POST_A || !process.env.SMB_TEST_ANALYTICS_POST_B, "Requires temporary published posts.");
  const ids = [process.env.SMB_TEST_ANALYTICS_POST_A!, process.env.SMB_TEST_ANALYTICS_POST_B!];
  const events: Record<string, string>[] = [];
  page.on("request", request => {
    if (request.url().includes("/rest/v1/rpc/record_page_view")) events.push(request.postDataJSON());
  });
  let response = page.waitForResponse(r => r.url().includes("/rpc/record_page_view") && r.ok());
  await page.goto(`/read?id=${ids[0]}`);
  await response;
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Analytics verification A");
  response = page.waitForResponse(r => r.url().includes("/rpc/record_page_view") && r.ok());
  await page.evaluate(id => window.history.pushState(null, "", `/read?id=${id}`), ids[1]);
  await response;
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Analytics verification B");
  expect(events.map(event => event.p_post_id)).toEqual(ids);
  writeFileSync(`test-results/analytics-posts-${test.info().project.name}.json`, JSON.stringify(events));
});

test("blocked local storage still sends a visitor event", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Storage unavailable"); };
    Storage.prototype.setItem = () => { throw new Error("Storage unavailable"); };
  });
  const response = page.waitForResponse(r => r.url().includes("/rpc/record_page_view") && r.ok());
  await page.goto("/");
  await response;
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
