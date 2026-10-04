import { test, expect } from "@playwright/test";
test("article, navigation, contents and preview discussion", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/tutorials/ict-reclaimed-order-block");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "ICT Reclaimed Order Block",
  );
  await page
    .getByRole("link", { name: "Bullish Reclaimed Order Block", exact: true })
    .click();
  await expect(page).toHaveURL(/#bullish$/);
  await page.getByText("How is a reclaimed block different").click();
  await expect(
    page.getByText("A reclaimed block is interpreted"),
  ).toBeVisible();
  await page.getByLabel("Comment *").fill("My preview chart study comment.");
  await page.getByLabel("Name *", { exact: true }).fill("Test Reader");
  await page.getByRole("button", { name: "Post Preview Comment" }).click();
  await expect(page.getByText("Test Reader · Preview comment")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Test Reader · Preview comment")).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("library search, categories, empty state and downloads", async ({
  page,
  request,
}) => {
  await page.goto("/resources");
  await expect(page.getByRole("status")).toHaveText("7 resources found");
  await page
    .getByRole("searchbox", { name: "Search resources" })
    .fill("glossary");
  await expect(page.getByRole("status")).toHaveText("1 resource found");
  const download = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download PDF", exact: true })
    .first()
    .click();
  expect((await download).suggestedFilename()).toBe("ict-glossary.pdf");
  await page
    .getByRole("searchbox", { name: "Search resources" })
    .fill("no-such-resource");
  await expect(
    page.getByRole("heading", { name: "No resources found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear Filters" }).click();
  await page.getByLabel("Resource type").selectOption("Worksheets");
  await expect(page.getByRole("status")).toHaveText("2 resources found");
  for (const slug of [
    "smart-money-playbook",
    "ict-glossary",
    "trade-checklist",
    "trading-journal",
    "ict-reclaimed-order-block",
    "fair-value-gap",
    "liquidity-sweep",
  ]) {
    const response = await request.get(`/pdfs/${slug}.pdf`);
    expect(response.status()).toBe(200);
    expect((await response.body()).toString().startsWith("%PDF-1.4")).toBe(
      true,
    );
  }
});
test("all pages and header search work without overflow", async ({ page }) => {
  for (const path of [
    "/",
    "/blog",
    "/tutorials",
    "/market-structure",
    "/books",
    "/resources",
    "/tutorials/fair-value-gap",
    "/tutorials/liquidity-sweep",
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Search resources" }).click();
  await page.getByLabel("Search the library").fill("glossary");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/resources\?q=glossary/);
  await expect(page.getByRole("status")).toHaveText("1 resource found");
  if (test.info().project.name === "mobile") {
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page
      .getByRole("link", { name: "ICT Tutorials", exact: true })
      .click();
    await expect(page).toHaveURL(/\/tutorials$/);
  }
  const missing = await page.goto("/tutorials/missing");
  expect(missing?.status()).toBe(404);
});

test("home learning paths, toolkit downloads and shared design system", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Read price.Build your process.",
  );
  await page.evaluate(() => document.fonts.ready);
  const theme = await page.evaluate(() => ({
    primary: getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim(),
    font: getComputedStyle(document.body).fontFamily,
  }));
  expect(theme.primary).toBe("#fed415");
  expect(theme.font).toContain("urbanist");
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByRole("link", { name: "Explore the Tutorials", exact: true })
    .click();
  await expect(page).toHaveURL(/\/tutorials$/);
  await page.goto("/");
  await page
    .getByRole("link", { name: "Get the checklist", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("1 resource found");
  await page.goto("/");
  const download = page.waitForEvent("download");
  await page.locator(".toolkit-resource").first().click();
  expect((await download).suggestedFilename()).toBe("ict-glossary.pdf");
  await page.getByRole("link", { name: "Open reclaimed order block study", exact: false }).click();
  await expect(page).toHaveURL(/ict-reclaimed-order-block$/);
  expect(errors).toEqual([]);
});
