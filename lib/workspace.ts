import { articles, resources } from "./content";
export type PostKind = "blog" | "tutorial";
export type ManagedPost = {
  id: string;
  title: string;
  description: string;
  kind: PostKind;
  html: string;
  cover: string;
  status: "draft" | "published";
  updatedAt: string;
  views: number;
  seedSlug?: string;
  customized?: boolean;
  kindConfirmed?: boolean;
};
export type ManagedResource = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  filename: string;
  url?: string;
  file?: Blob;
  size: number;
  published: boolean;
  updatedAt: string;
};
export type Workspace = { posts: ManagedPost[]; resources: ManagedResource[] };
export const DEMO_EMAIL = "admin@smartmoneybook.demo";
export const DEMO_PASSWORD = "SmartMoney2026!";
export const escapeHTML = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function seedWorkspace(): Workspace {
  return {
    posts: articles.map((a, i) => ({
      id: a.slug,
      title: a.title,
      description: a.description,
      kind: "tutorial",
      html: a.sections
        .map(
          (s) =>
            `<h2>${escapeHTML(s.title)}</h2>${s.paragraphs.map((p) => `<p>${escapeHTML(p)}</p>`).join("")}${s.points ? `<ol>${s.points.map((p) => `<li>${escapeHTML(p)}</li>`).join("")}</ol>` : ""}`,
        )
        .join(""),
      cover: "",
      status: "published",
      updatedAt: "2026-10-04T00:00:00Z",
      views: [1240, 856, 632][i],
      seedSlug: a.slug,
    })),
    resources: resources.map((r) => ({
      id: r.slug,
      slug: r.slug,
      title: r.title,
      description: r.description,
      category: r.category,
      filename: r.slug + ".pdf",
      url: `/pdfs/${r.slug}.pdf`,
      size: 0,
      published: true,
      updatedAt: "2026-10-04T00:00:00Z",
    })),
  };
}
export function postURL(post: ManagedPost) {
  return post.seedSlug && !post.customized
    ? `/tutorials/${post.seedSlug}`
    : `/read?id=${encodeURIComponent(post.id)}`;
}
export const blankPost = (): ManagedPost => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  kind: "blog",
  html: "",
  cover: "",
  status: "draft",
  updatedAt: new Date().toISOString(),
  views: 0,
});
export function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (
      !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
        file.type,
      )
    )
      return reject(new Error("Choose a PNG, JPEG, WebP, or GIF image."));
    if (file.size > 5 * 1024 * 1024)
      return reject(new Error("Images must be 5 MB or smaller."));
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });
}
export async function validatePDF(file: File) {
  if (file.size > 15 * 1024 * 1024)
    throw new Error("Choose a PDF smaller than 15 MB.");
  const signature = new TextDecoder().decode(
    await file.slice(0, 5).arrayBuffer(),
  );
  if (signature !== "%PDF-") throw new Error("This file is not a valid PDF.");
}
