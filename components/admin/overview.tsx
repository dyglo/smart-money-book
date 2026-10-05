"use client";
import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  BookOpen,
  Users,
  Eye,
  Plus,
  Search,
  PenLine,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { useWorkspace } from "../workspace-provider";
import { postURL } from "@/lib/workspace";
import { AdminShell } from "./shell";
import { Modal } from "./modal";
export function Overview() {
  const { data, session, deletePost, analytics } = useWorkspace();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const posts = data.posts.filter(
    (p) =>
      (filter === "all" || p.status === filter) &&
      p.title.toLowerCase().includes(query.toLowerCase()),
  );
  const views = analytics.contentViews;
  return (
    <AdminShell title="Overview">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">YOUR PUBLISHING DESK</span>
          <h1>Good to see you, {session?.name.split(" ")[0] ?? "Admin"}.</h1>
          <p>A clear view of your content and what comes next.</p>
        </div>
        <Link className="button" href="/admin/editor">
          <Plus size={18} /> Create a Post
        </Link>
      </div>
      <div className="stat-grid">
        {[
          {
            label: "Blog posts",
            value: data.posts.filter((p) => p.kind === "blog").length,
            detail: "Published and draft posts",
            icon: FileText,
          },
          {
            label: "Tutorials",
            value: data.posts.filter((p) => p.kind === "tutorial").length,
            detail: "Published and draft lessons",
            icon: BookOpen,
          },
          {
            label: "Visitors",
            value: analytics.visitors.toLocaleString(),
            detail: "Unique browsers · last 7 days",
            icon: Users,
          },
          {
            label: "Content views",
            value: views.toLocaleString(),
            detail: "Recorded content views",
            icon: Eye,
          },
        ].map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div>
              <span>{stat.label}</span>
              <stat.icon size={19} />
            </div>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </div>
        ))}
      </div>
      <div className="overview-middle">
        <section className="admin-card activity-card">
          <div className="admin-card-heading">
            <div>
              <h2>Visitor activity</h2>
              <p>Unique browsers over the last seven days.</p>
            </div>
            <span className="subtle-chip">Last 7 days</span>
          </div>
          <div
            className="visitor-chart"
            role="img"
            aria-label={`Visitor activity: ${analytics.daily.map(d => `${d.day}: ${d.visitors}`).join(", ")}`}
          >
            {analytics.daily.map((day, i) => (
              <div key={i}>
                <span className="visitor-value">{day.visitors}</span>
                <div style={{ height: `${Math.min(180, day.visitors / Math.max(1, ...analytics.daily.map(d => d.visitors)) * 180)}px` }} />
                <small>
                  {new Date(day.day + "T12:00:00+03:00").toLocaleDateString("en-US", { weekday: "short", timeZone: "Africa/Nairobi" })}
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-card quick-card">
          <span className="admin-eyebrow">KEEP THE LIBRARY GROWING</span>
          <h2>What will you share next?</h2>
          <p>
            A chart lesson, a strategy note, or a PDF your readers can keep.
          </p>
          <Link href="/admin/editor">
            <PenLine size={18} />
            <span>Write a new lesson</span>
            <ArrowUpRight size={17} />
          </Link>
          <Link href="/admin/resources">
            <FileText size={18} />
            <span>Upload a PDF resource</span>
            <ArrowUpRight size={17} />
          </Link>
          <div className="draft-summary">
            <strong>
              {data.posts.filter((p) => p.status === "draft").length}
            </strong>
            <span>drafts waiting for your next idea</span>
          </div>
        </section>
      </div>
      <section className="admin-card">
        <div className="admin-card-heading">
          <div>
            <h2>Your content</h2>
            <p>Edit a draft, review a lesson, or open a published preview.</p>
          </div>
          <span className="subtle-chip">{data.posts.length} posts</span>
        </div>
        <div className="content-controls">
          <div className="admin-tabs">
            {["all", "published", "draft"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                aria-pressed={filter === tab}
              >
                {tab === "all"
                  ? "All content"
                  : tab === "published"
                    ? "Published"
                    : "Drafts"}
              </button>
            ))}
          </div>
          <label className="admin-search">
            <Search size={17} />
            <input
              aria-label="Search posts"
              placeholder="Search posts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        {error && (
          <p role="alert" className="admin-error">
            {error}
          </p>
        )}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>
                  Views
                </th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.title || "Untitled draft"}</strong>
                  </td>
                  <td>{p.kind === "blog" ? "Blog" : "Tutorial"}</td>
                  <td>
                    <span className={`status-chip ${p.status}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.views.toLocaleString()}</td>
                  <td>
                    {new Date(p.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link
                        aria-label={`Edit ${p.title}`}
                        title="Edit"
                        href={`/admin/editor?id=${encodeURIComponent(p.id)}`}
                      >
                        <PenLine size={16} />
                      </Link>
                      <Link
                        aria-label={`Preview ${p.title}`}
                        title="Preview"
                        href={postURL(p)}
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        aria-label={`Delete ${p.title}`}
                        title="Delete"
                        onClick={() => setPending(p.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && (
            <div className="admin-empty">
              <FileText />
              <h3>No posts here yet</h3>
              <p>
                {query
                  ? "Try another search."
                  : "Start a new post and save your first draft."}
              </p>
              <Link href="/admin/editor">Open the editor</Link>
            </div>
          )}
        </div>
      </section>
      {pending && (
        <Modal title="Delete this post?" onClose={() => setPending(null)}>
          <p>
            This removes it from the workspace and published
            previews.
          </p>
          <div className="modal-actions">
            <button onClick={() => setPending(null)}>Cancel</button>
            <button
              className="button"
              onClick={async () => {
                try {
                  await deletePost(pending);
                  setPending(null);
                } catch (e) {
                  setError((e as Error).message);
                  setPending(null);
                }
              }}
            >
              Delete Post
            </button>
          </div>
        </Modal>
      )}
    </AdminShell>
  );
}
