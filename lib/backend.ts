import { supabase } from "./supabase";
import type { ManagedPost, ManagedResource, Workspace } from "./workspace";

export type Analytics = { visitors: number; daily: { day: string; visitors: number }[]; views: Record<string, number> };
export const emptyAnalytics: Analytics = { visitors: 0, daily: [], views: {} };
export const ADMIN_EMAIL = "tafartechlabs@gmail.com";
export type AdminSession = { id: string; name: string; email: string };

export async function adminSession(): Promise<AdminSession | null> {
  const client = supabase();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: approved, error: approvalError } = await client.rpc("is_admin");
  if (approvalError) throw approvalError;
  const name = typeof user.user_metadata.name === "string" && user.user_metadata.name.trim() ? user.user_metadata.name : "Admin";
  return approved ? { id: user.id, name, email: user.email! } : null;
}

function imagePath(source: string): string | null {
  if (source.startsWith("storage://images/")) return source.slice("storage://images/".length);
  try {
    const url = new URL(source);
    if (url.origin !== new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin) return null;
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:sign|public)\/images\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch { return null; }
}
async function resolveImage(source: string) {
  const path = imagePath(source);
  if (!path) return source;
  const { data, error } = await supabase().storage.from("images").createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
async function resolvePost(p: { id: string; slug: string; title: string; description: string; kind: ManagedPost["kind"]; html: string; cover: string; status: ManagedPost["status"]; kind_confirmed: boolean; updated_at: string }, views: number): Promise<ManagedPost> {
  const document = new DOMParser().parseFromString(p.html, "text/html");
  await Promise.all(Array.from(document.querySelectorAll("img")).map(async image => {
    image.src = await resolveImage(image.getAttribute("src") ?? "");
  }));
  return { id: p.id, slug: p.slug, title: p.title, description: p.description, kind: p.kind,
    html: document.body.innerHTML, cover: await resolveImage(p.cover), status: p.status,
    kindConfirmed: p.kind_confirmed, updatedAt: p.updated_at, views };
}

export async function loadWorkspace(admin: boolean): Promise<{ workspace: Workspace; analytics: Analytics }> {
  const client = supabase();
  const [posts, resources, analytics] = await Promise.all([
    client.from("posts").select("*").order("updated_at", { ascending: false }),
    client.from("resources").select("*").order("updated_at", { ascending: false }),
    admin ? client.rpc("admin_analytics") : Promise.resolve({ data: emptyAnalytics, error: null }),
  ]);
  for (const result of [posts, resources, analytics]) if (result.error) throw result.error;
  const stats = analytics.data as Analytics;
  const files = await Promise.all((resources.data ?? []).map(async (r) => {
    const { data, error } = await client.storage.from("resources").createSignedUrl(r.storage_path, 3600, { download: r.filename });
    if (error) throw error;
    return { id: r.id, slug: r.slug, title: r.title, description: r.description, category: r.category,
      filename: r.filename, storagePath: r.storage_path, size: r.size, published: r.published,
      updatedAt: r.updated_at, url: data.signedUrl } satisfies ManagedResource;
  }));
  const resolvedPosts = await Promise.all((posts.data ?? []).map(p => resolvePost(p, stats.views[p.id] ?? 0)));
  return { workspace: { posts: resolvedPosts, resources: files }, analytics: stats };
}

async function uploadImage(source: string, postId: string, uploaded: string[]) {
  if (!source.startsWith("data:image/")) {
    const path = imagePath(source);
    return path ? `storage://images/${path}` : source;
  }
  const blob = await (await fetch(source)).blob();
  const ext = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" }[blob.type];
  if (!ext || blob.size > 5 * 1024 * 1024) throw new Error("Images must be PNG, JPEG, WebP, or GIF and 5 MB or smaller.");
  const path = `${postId}/${crypto.randomUUID()}.${ext}`;
  const client = supabase();
  const { error } = await client.storage.from("images").upload(path, blob, { contentType: blob.type });
  if (error) throw error;
  uploaded.push(path);
  return `storage://images/${path}`;
}

export async function writePost(post: ManagedPost) {
  const client = supabase();
  const uploaded: string[] = [];
  try {
    const document = new DOMParser().parseFromString(post.html, "text/html");
    for (const image of document.querySelectorAll("img")) image.src = await uploadImage(image.getAttribute("src") ?? "", post.id, uploaded);
    const cover = await uploadImage(post.cover, post.id, uploaded);
    const { error } = await client.from("posts").upsert({ id: post.id, slug: post.slug || post.id, title: post.title,
      description: post.description, kind: post.kind, html: document.body.innerHTML, cover, status: post.status,
      kind_confirmed: Boolean(post.kindConfirmed) });
    if (error) throw error;
    return resolvePost({ ...post, slug: post.slug || post.id, html: document.body.innerHTML, cover, kind_confirmed: Boolean(post.kindConfirmed), updated_at: new Date().toISOString() }, post.views);
  } catch (error) {
    if (uploaded.length) await client.storage.from("images").remove(uploaded);
    throw error;
  }
}

export async function writeResource(resource: ManagedResource) {
  const client = supabase();
  let path = resource.storagePath;
  let uploaded = false;
  if (resource.file) {
    path = `${resource.id}/${crypto.randomUUID()}.pdf`;
    const { error } = await client.storage.from("resources").upload(path, resource.file, { contentType: "application/pdf" });
    if (error) throw error;
    uploaded = true;
  }
  if (!path) throw new Error("Choose a PDF to upload.");
  const { error } = await client.from("resources").upsert({ id: resource.id, slug: resource.slug, title: resource.title,
    description: resource.description, category: resource.category, filename: resource.filename,
    storage_path: path, size: resource.size, published: resource.published });
  if (error) {
    if (uploaded) await client.storage.from("resources").remove([path]);
    throw error;
  }
  if (uploaded && resource.storagePath && resource.storagePath !== path) {
    const { error: cleanup } = await client.storage.from("resources").remove([resource.storagePath]);
    if (cleanup) console.error("Superseded PDF cleanup failed", cleanup.message);
  }
}

export function visitorId() {
  const key = "smb-visitor-id";
  const saved = localStorage.getItem(key);
  if (saved && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(saved)) return saved;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}
