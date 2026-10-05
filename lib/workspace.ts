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
  slug?: string;
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
  storagePath?: string;
  file?: Blob;
  size: number;
  published: boolean;
  updatedAt: string;
};
export type Workspace = { posts: ManagedPost[]; resources: ManagedResource[] };
export const escapeHTML = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export function postURL(post: ManagedPost) {
  return post.kind === "tutorial" && post.status === "published"
    ? `/tutorials/${encodeURIComponent(post.slug || post.id)}`
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
