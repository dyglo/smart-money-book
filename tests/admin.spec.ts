import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
const image = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
  "base64",
);

function imagePDF(scanned = false) {
  const pixel = Buffer.from([255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255]);
  const stream =
    (scanned ? "" : "BT /F1 16 Tf 40 740 Td (Embedded image study) Tj ET\n") +
    "q 200 0 0 100 40 400 cm /Img Do Q";
  const objects = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    Buffer.from(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> /XObject << /Img 6 0 R >> >> /Contents 5 0 R >>",
    ),
    Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
    Buffer.from(
      `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    ),
    Buffer.concat([
      Buffer.from(
        "<< /Type /XObject /Subtype /Image /Width 2 /Height 2 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length 12 >>\nstream\n",
      ),
      pixel,
      Buffer.from("\nendstream"),
    ]),
  ];
  let pdf = Buffer.from("%PDF-1.4\n");
  const offsets: number[] = [];
  objects.forEach((object, i) => {
    offsets.push(pdf.length);
    pdf = Buffer.concat([
      pdf,
      Buffer.from(`${i + 1} 0 obj\n`),
      object,
      Buffer.from("\nendobj\n"),
    ]);
  });
  const offset = pdf.length;
  return Buffer.concat([
    pdf,
    Buffer.from(
      `xref\n0 7\n0000000000 65535 f \n${offsets.map((o) => String(o).padStart(10, "0") + " 00000 n ").join("\n")}\ntrailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`,
    ),
  ]);
}
async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "Use demo credentials" }).click();
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: /Good to see you/ }),
  ).toBeVisible();
}
test("mock authentication, route guard, sidebar and signup", async ({
  page,
}) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("Email address").fill("wrong@example.com");
  await page.getByLabel("Password", { exact: true }).fill("bad");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page.locator(".admin-error[role=alert]")).toContainText(
    "incorrect",
  );
  await page.getByRole("button", { name: "Use demo credentials" }).click();
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(/dashboard$/);
  if (test.info().project.name === "desktop") {
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect(page.locator(".admin-workspace")).toHaveClass(
      /sidebar-collapsed/,
    );
    await page.reload();
    await expect(page.locator(".admin-workspace")).toHaveClass(
      /sidebar-collapsed/,
    );
    await page.getByRole("button", { name: "Expand sidebar" }).click();
  } else {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(
      page.getByRole("link", { name: "Editor", exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/admin\/login$/);
  await page.goto("/admin/sign-up");
  await page.getByLabel("Your name").fill("Jordan");
  await page.getByLabel("Email address").fill("jordan@example.com");
  await page.getByLabel("Password", { exact: true }).fill("DemoPassword123");
  await page.getByRole("button", { name: "Create Demo Account" }).click();
  await expect(
    page.getByRole("heading", { name: "Good to see you, Jordan." }),
  ).toBeVisible();
  if (test.info().project.name === "mobile")
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/login");
  await expect(page).toHaveURL(/admin\/login$/);
  await page.getByLabel("Email address").fill("jordan@example.com");
  await page.getByLabel("Password", { exact: true }).fill("DemoPassword123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Good to see you, Jordan." }),
  ).toBeVisible();
});
test("Word canvas formats, saves, publishes and edits a post", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await signIn(page);
  await page.goto("/admin/editor");
  await page
    .getByLabel("Post title", { exact: true })
    .fill("My London session strategy");
  await page
    .getByLabel("Post summary")
    .fill("A practical plan for the London session.");
  const document = page.getByRole("textbox", {
    name: "Article content",
    exact: true,
  });
  await document.fill("Study the structure");
  await document.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(document.locator("strong")).toHaveText("Study the structure");
  await page.getByLabel("Text style").selectOption("1");
  await expect(document.locator("h1")).toHaveText("Study the structure");
  await document.press("ArrowRight");
  await document.press("Enter");
  await document.pressSequentially("Wait for displacement before a retest.");
  await page.getByRole("button", { name: "Italic", exact: true }).click();
  await document.pressSequentially(" Keep a journal.");
  await expect(document.locator("em")).toContainText("Keep a journal");
  await page.getByRole("button", { name: "Insert table", exact: true }).click();
  await expect(document.locator("table")).toHaveCount(1);
  await page.getByRole("button", { name: "Add row", exact: true }).click();
  await expect(document.locator("tr")).toHaveCount(4);
  await page
    .getByLabel("Inline image file")
    .setInputFiles({ name: "chart.png", mimeType: "image/png", buffer: image });
  await expect(document.locator("img")).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(document.locator("img")).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(document.locator("img")).toHaveCount(1);
  await page
    .getByLabel("Cover image file")
    .setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: image });
  await expect(page.getByAltText("Post cover preview")).toBeVisible();
  await page.getByRole("button", { name: "Save Draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved on this device");
  await page.reload();
  await expect(page.getByLabel("Post title", { exact: true })).toHaveValue(
    "My London session strategy",
  );
  await expect(
    page.getByRole("textbox", { name: "Article content" }).locator("table"),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Publish to Preview" }).click();
  await expect(page.locator(".admin-error[role=alert]")).toContainText(
    "choose Blog or Tutorial",
  );
  await page.getByRole("radio", { name: /Blog post/ }).check();
  await page.getByRole("button", { name: "Publish to Preview" }).click();
  await expect(page.getByRole("status")).toContainText("Published");
  await page.getByRole("link", { name: "Preview saved post" }).click();
  await expect(
    page.getByRole("heading", {
      name: "My London session strategy",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".rich-article table")).toHaveCount(1);
  await expect(page.locator(".rich-article img")).toHaveCount(1);
  await page.goto("/blog");
  await expect(
    page.getByRole("heading", {
      name: "My London session strategy",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/admin/dashboard");
  await expect(
    page.getByRole("cell", { name: "My London session strategy", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Edit My London session strategy" })
    .click();
  await page
    .getByLabel("Post title", { exact: true })
    .fill("Updated London session strategy");
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved on this device");
  await page.goto("/blog");
  await expect(
    page.getByRole("heading", { name: "Updated London session strategy" }),
  ).toBeVisible();
  await page.goto("/admin/dashboard");
  await page
    .getByRole("link", { name: "Edit Updated London session strategy" })
    .click();
  await page
    .getByRole("button", { name: "Move to draft", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Saved on this device");
  await page.goto("/blog");
  await expect(
    page.getByRole("heading", { name: "Updated London session strategy" }),
  ).toHaveCount(0);
  await page.goto("/admin/editor");
  await page.getByLabel("Post title", { exact: true }).fill("Unsaved note");
  if (test.info().project.name === "mobile")
    await page.getByRole("button", { name: "Open navigation" }).click();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(page).toHaveURL(/admin\/editor$/);
  await expect(page.getByLabel("Post title", { exact: true })).toHaveValue(
    "Unsaved note",
  );
  expect(errors).toEqual([]);
});
test("PDF import, resource upload, persistence, download and deletion", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/admin/editor");
  await page
    .getByLabel("Import PDF file")
    .setInputFiles("public/pdfs/ict-reclaimed-order-block.pdf");
  await expect(page.getByRole("status")).toContainText("Imported 1 page", {
    timeout: 20000,
  });
  await expect(
    page.getByRole("textbox", { name: "Article content" }),
  ).toContainText("Study checklist");
  await page
    .getByLabel("Post title", { exact: true })
    .fill("Imported order block notes");
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("radio", { name: /Tutorial/ }).check();
  await page.getByRole("button", { name: "Publish to Preview" }).click();
  await expect(page.getByRole("status")).toContainText("Published");
  await page.goto("/tutorials");
  await expect(
    page.getByRole("heading", { name: "Imported order block notes" }),
  ).toBeVisible();
  await page.goto("/admin/resources");
  await page.getByLabel("Resource PDF file").setInputFiles({
    name: "bad.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("not a PDF"),
  });
  await expect(page.locator(".admin-error[role=alert]")).toContainText(
    "not a valid PDF",
  );
  await page
    .getByLabel("Resource PDF file")
    .setInputFiles("public/pdfs/trade-checklist.pdf");
  await page.getByLabel("Resource title").fill("London session checklist");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A printable session routine.");
  await page.getByLabel("Category", { exact: true }).selectOption("Worksheets");
  await page.getByRole("button", { name: "Add to Library" }).click();
  await expect(page.getByRole("status")).toContainText("PDF added");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "London session checklist" }),
  ).toBeVisible();
  await page.goto("/resources?q=London");
  await expect(page.getByRole("status")).toHaveText("1 resource found");
  const download = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download PDF", exact: true })
    .first()
    .click();
  const downloaded = await download;
  expect(downloaded.suggestedFilename()).toBe("trade-checklist.pdf");
  const path = await downloaded.path();
  expect(fs.readFileSync(path!, "utf8").startsWith("%PDF-")).toBe(true);
  await page.goto("/admin/resources");
  await page
    .getByRole("button", { name: "Hide London session checklist" })
    .click();
  await page.goto("/resources?q=London");
  await expect(
    page.getByRole("heading", { name: "No resources found" }),
  ).toBeVisible();
  await page.goto("/admin/resources");
  await page
    .getByRole("button", { name: "Publish London session checklist" })
    .click();
  await page
    .getByRole("button", { name: "Delete London session checklist" })
    .click();
  await page
    .getByRole("button", { name: "Delete Resource", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "London session checklist" }),
  ).toHaveCount(0);
  await page.goto("/admin/dashboard");
  await page
    .getByRole("button", { name: "Delete Imported order block notes" })
    .click();
  await page.getByRole("button", { name: "Delete Post", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Imported order block notes", exact: true }),
  ).toHaveCount(0);
});
test("admin pages fit mobile and tablet screens", async ({ page }) => {
  await signIn(page);
  for (const path of [
    "/admin/dashboard",
    "/admin/editor",
    "/admin/resources",
  ]) {
    await page.goto(path);
    await expect(page.locator(".admin-page-heading h1")).toBeVisible();
    for (const width of [360, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});

test("PDF embedded images and scanned-page handling", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/editor");
  await page.getByLabel("Import PDF file").setInputFiles({
    name: "illustrated.pdf",
    mimeType: "application/pdf",
    buffer: imagePDF(),
  });
  await expect(page.getByRole("status")).toContainText(
    "Imported 1 page and 1 image",
    { timeout: 20000 },
  );
  const canvas = page.getByRole("textbox", { name: "Article content" });
  await expect(canvas).toContainText("Embedded image study");
  await expect(canvas.locator("img")).toHaveCount(1);
  await page.getByLabel("Import PDF file").setInputFiles({
    name: "scanned.pdf",
    mimeType: "application/pdf",
    buffer: imagePDF(true),
  });
  await expect(page.getByRole("status")).toContainText(
    "OCR is needed for editable text",
    { timeout: 20000 },
  );
  await expect(canvas.locator("img")).toHaveCount(2);
  await canvas.press("ArrowRight");
  await canvas.press("Enter");
  await page.evaluate(() => {
    const image = new File(
      [
        Uint8Array.from(
          atob(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
          ),
          (c) => c.charCodeAt(0),
        ),
      ],
      "pasted-chart.png",
      { type: "image/png" },
    );
    const transfer = new DataTransfer();
    transfer.items.add(image);
    const editor = document.querySelector(".word-document")!;
    editor.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: transfer,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await expect(canvas.locator("img")).toHaveCount(3);
});
