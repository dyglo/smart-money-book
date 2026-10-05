"use client";
import Link from "next/link";
import { useWorkspace } from "./workspace-provider";
import { postURL } from "@/lib/workspace";
import { Sidebar } from "./sidebar";
export function IndexPage({
  title,
  description,
  marketOnly = false,
}: {
  title: string;
  description: string;
  marketOnly?: boolean;
}) {
  const { data, ready } = useWorkspace();
  const list = data.posts.filter(
    (p) =>
      p.status === "published" &&
      (marketOnly
        ? p.kind === "tutorial" && /structure|fair value gap|displacement|imbalance/i.test(`${p.title} ${p.description}`)
        : title === "Trading Strategy Blog"
          ? p.kind === "blog"
          : p.kind === "tutorial"),
  );
  return (
    <main id="main" className="content-grid">
      <section className="article-panel">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>»</span>
          {title}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="article-list">
          {!ready && <p role="status">Opening the library…</p>}
          {ready && list.length === 0 && (
            <div className="empty-state">
              <h2>New lessons are on the way.</h2>
              <p>Explore our other tutorials and study resources.</p>
              <Link href="/resources">Browse the library</Link>
            </div>
          )}
          {list.map((a, i) => (
            <article className="article-preview" key={a.id}>
              <Link href={postURL(a)} className={`preview-cover preview-${i}`}>
                <span>ICT STUDY NOTES</span>
                <strong>{a.title.split(" — ")[0]}</strong>
                <small>SMART MONEY BOOK</small>
              </Link>
              <div className="category-label">
                {a.kind === "blog" ? "Strategy Blog" : "ICT Tutorial"}
              </div>
              <h2>
                <Link href={postURL(a)}>{a.title}</Link>
              </h2>
              <p className="muted">
                {new Date(a.updatedAt).toLocaleDateString("en-US")}
              </p>
              <p>{a.description}</p>
              <Link className="text-link" href={postURL(a)}>
                Read {a.kind === "blog" ? "Post" : "Tutorial"}
              </Link>
            </article>
          ))}
        </div>
      </section>
      <Sidebar />
    </main>
  );
}
