"use client";
import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import Link from "next/link";
import Image from "next/image";
import { useWorkspace } from "./workspace-provider";
import { Sidebar } from "./sidebar";
import { ShareButtons, Comments } from "./interactions";
import { supabase } from "@/lib/supabase";
import { visitorId } from "@/lib/backend";
export function TutorialPost({ slug }: { slug: string }) {
  const { data, ready } = useWorkspace();
  if (!ready) return <div className="foundation" role="status">Opening lesson…</div>;
  const post = data.posts.find(p => p.slug === slug && p.kind === "tutorial");
  return post ? <RichPost id={post.id} /> : <MissingPost />;
}
export function PublishedPost() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    setId(new URLSearchParams(location.search).get("id") ?? "");
  }, []);
  if (id === null)
    return (
      <div className="foundation" role="status">
        Opening post…
      </div>
    );
  return <RichPost id={id} />;
}
function MissingPost() {
  return (
    <main id="main" className="foundation">
      <h1>Post unavailable</h1>
      <p>
        This post may be a draft or has been removed from the website’s
        preview.
      </p>
      <Link href="/tutorials">Browse tutorials</Link>
    </main>
  );
}
function RichPost({ id }: { id: string }) {
  const { data, ready, session } = useWorkspace();
  const post = data.posts.find((p) => p.id === id);
  useEffect(() => {
    if (post?.status !== "published") return;
    try { void supabase().rpc("record_visit", { p_visitor: visitorId(), p_path: location.pathname + location.search, p_post_id: id }); } catch { /* Reading works without analytics storage. */ }
  }, [id, post?.status]);
  if (!ready)
    return (
      <div className="foundation" role="status">
        Opening post…
      </div>
    );
  if (!post || (post.status === "draft" && !session)) return <MissingPost />;
  return (
    <main id="main" className="content-grid">
      <article className="article-panel">
        <div className="update-callout">
          {post.status === "draft" ? "Draft preview" : "Published preview"} ·
          Saved to the library.{" "}
          {session && (
            <Link href={`/admin/editor?id=${encodeURIComponent(id)}`}>
              Edit post
            </Link>
          )}
        </div>
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>»</span>
          <Link href={post.kind === "blog" ? "/blog" : "/tutorials"}>
            {post.kind === "blog" ? "Blog" : "Tutorials"}
          </Link>
        </div>
        <h1>{post.title || "Untitled draft"}</h1>
        <div className="article-meta">
          <span>Smart Money Book</span>
          <span>
            {new Date(post.updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <ShareButtons />
        {post.cover && (
          <Image
            src={post.cover}
            alt={`${post.title} cover`}
            width={960}
            height={540}
            unoptimized
            className="published-cover"
          />
        )}
        {post.description && <p>{post.description}</p>}
        <div
          className="article-content rich-article"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.html) }}
        />
        <Comments postId={post.id} />
      </article>
      <Sidebar />
    </main>
  );
}
