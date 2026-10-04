"use client";
import { useState } from "react";
import Link from "next/link";
import { useWorkspace } from "./workspace-provider";
import { ResourceDownload } from "./resource-download";
import { postURL } from "@/lib/workspace";
export function Library({
  booksOnly = false,
  initialQuery = "",
}: {
  booksOnly?: boolean;
  initialQuery?: string;
}) {
  const { data } = useWorkspace();
  const resources = data.resources.filter((r) => r.published);
  const articles = data.posts.filter((p) => p.status === "published");
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("All");
  const filtered = resources.filter(
    (r) =>
      (!booksOnly || r.category === "Books") &&
      (category === "All" || r.category === category) &&
      `${r.title} ${r.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const lessons =
    booksOnly || category !== "All"
      ? []
      : articles.filter((a) =>
          `${a.title} ${a.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        );
  return (
    <>
      <div className="library-controls">
        <div>
          <label htmlFor="resource-search">
            Search {booksOnly ? "books" : "resources"}
          </label>
          <input
            id="resource-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the library…"
          />
        </div>
        {!booksOnly && (
          <div>
            <label htmlFor="category">Resource type</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["All", "Books", "Reference", "Worksheets"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <p className="result-count" role="status">
        {filtered.length + lessons.length}{" "}
        {filtered.length + lessons.length === 1 ? "resource" : "resources"}{" "}
        found
      </p>
      <div className="resource-cards">
        {filtered.map((r) => (
          <article className="resource-card" key={r.slug}>
            <div className={`resource-cover ${r.category.toLowerCase()}`}>
              <span>SMART MONEY BOOK</span>
              <strong>{r.title}</strong>
              <small>ICT EDUCATIONAL SERIES</small>
            </div>
            <div className="resource-card-content">
              <span className="category-label">
                {r.category} · {r.file ? "PDF" : "Sample PDF"}
              </span>
              <h2>{r.title}</h2>
              <p>{r.description}</p>
              <ResourceDownload resource={r} />
            </div>
          </article>
        ))}
        {lessons.map((a) => (
          <article key={a.id} className="resource-card lesson-card">
            <div className="resource-card-content">
              <span className="category-label">
                {a.kind === "blog" ? "Blog" : "Tutorial"}
              </span>
              <h2>{a.title}</h2>
              <p>{a.description}</p>
              <Link className="text-link" href={postURL(a)}>
                Read Tutorial
              </Link>
            </div>
          </article>
        ))}
      </div>
      {filtered.length + lessons.length === 0 && (
        <div className="empty-state">
          <h2>No resources found</h2>
          <p>Try another keyword or choose a different resource type.</p>
          <button
            className="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
      <p className="mock-note">
        PDFs in this first edition are downloadable samples. Published books and
        resources will be added to this library.
      </p>
    </>
  );
}
