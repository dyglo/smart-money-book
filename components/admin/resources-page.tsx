"use client";
import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  PenLine,
  Download,
  Search,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useWorkspace } from "../workspace-provider";
import { validatePDF, type ManagedResource } from "@/lib/workspace";
import { AdminShell } from "./shell";
import { Modal } from "./modal";
import { ResourceDownload } from "../resource-download";
export function ResourcesPage() {
  const { data, saveResource, deleteResource } = useWorkspace();
  const [editing, setEditing] = useState<ManagedResource | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Reference");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  function reset() {
    setEditing(null);
    setFile(null);
    setTitle("");
    setDescription("");
    setCategory("Reference");
    setError("");
  }
  async function choose(f: File) {
    setError("");
    try {
      await validatePDF(f);
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <AdminShell title="Resources">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">THE RESOURCE LIBRARY</span>
          <h1>Good ideas, ready to keep.</h1>
          <p>Upload PDF books, reference guides, and worksheets.</p>
        </div>
        <span className="subtle-chip">{data.resources.length} resources</span>
      </div>
      <div className="resource-admin-grid">
        <section className="admin-card resource-upload-form">
          <div className="admin-card-heading">
            <h2>{editing ? "Edit resource" : "Add a PDF resource"}</h2>
            {editing && (
              <button aria-label="Cancel editing" onClick={reset}>
                <X size={18} />
              </button>
            )}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setBusy(true);
              try {
                if (!title.trim())
                  throw new Error("Give your resource a title.");
                if (!editing && !file)
                  throw new Error("Choose a PDF to upload.");
                const id = editing?.id ?? crypto.randomUUID();
                const next: ManagedResource = {
                  ...editing,
                  id,
                  slug: editing?.slug ?? id,
                  title: title.trim(),
                  description: description.trim(),
                  category,
                  filename: file?.name ?? editing!.filename,
                  file: file ?? editing?.file,
                  url: file ? undefined : editing?.url,
                  size: file?.size ?? editing?.size ?? 0,
                  published: editing?.published ?? true,
                  updatedAt: new Date().toISOString(),
                };
                await saveResource(next);
                setStatus(
                  editing
                    ? "Resource updated on this device."
                    : "PDF added to this browser’s resource library.",
                );
                reset();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <button
              className="resource-dropzone"
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) void choose(f);
              }}
            >
              <Upload size={28} />
              <strong>
                {file?.name ??
                  (editing ? "Replace PDF (optional)" : "Drop a PDF here")}
              </strong>
              <span>
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB`
                  : "or choose a file · PDF up to 15 MB"}
              </span>
            </button>
            <input
              ref={fileInput}
              type="file"
              hidden
              aria-label="Resource PDF file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void choose(f);
              }}
            />
            <label>
              Resource title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={160}
                placeholder="e.g. London Session Checklist"
              />
            </label>
            <label>
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={600}
                placeholder="Tell readers what they’ll find inside."
              />
            </label>
            <label>
              Category
              <select
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {["Books", "Reference", "Worksheets"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            {error && (
              <p className="admin-error" role="alert">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              <Upload size={17} />
              {busy ? "Saving…" : editing ? "Save Resource" : "Add to Library"}
            </button>
            {status && (
              <p className="editor-save-status" role="status">
                {status}
              </p>
            )}
          </form>
        </section>
        <section className="admin-card resource-management">
          <div className="admin-card-heading">
            <div>
              <h2>Your PDF library</h2>
              <p>Published resources appear on this device’s website.</p>
            </div>
          </div>
          <label className="admin-search">
            <Search size={17} />
            <input
              aria-label="Search admin resources"
              placeholder="Search resources…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="managed-resource-list">
            {data.resources
              .filter((r) =>
                r.title.toLowerCase().includes(query.toLowerCase()),
              )
              .map((r) => (
                <article className="managed-resource" key={r.id}>
                  <span className="managed-pdf-icon">
                    <FileText size={22} />
                  </span>
                  <div className="managed-resource-details">
                    <h3>{r.title}</h3>
                    <p>
                      {r.category} · {r.filename}
                    </p>
                    <span
                      className={`status-chip ${r.published ? "published" : "draft"}`}
                    >
                      {r.published ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <div className="table-actions">
                    <ResourceDownload resource={r} iconOnly />
                    <button
                      title="Edit resource"
                      aria-label={`Edit ${r.title}`}
                      onClick={() => {
                        setEditing(r);
                        setTitle(r.title);
                        setDescription(r.description);
                        setCategory(r.category);
                        setFile(null);
                        setStatus("");
                        setError("");
                      }}
                    >
                      <PenLine size={16} />
                    </button>
                    <button
                      title={r.published ? "Hide resource" : "Publish resource"}
                      aria-label={`${r.published ? "Hide" : "Publish"} ${r.title}`}
                      onClick={async () => {
                        try {
                          await saveResource({
                            ...r,
                            published: !r.published,
                            updatedAt: new Date().toISOString(),
                          });
                        } catch (e) {
                          setError((e as Error).message);
                        }
                      }}
                    >
                      {r.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      title="Delete resource"
                      aria-label={`Delete ${r.title}`}
                      onClick={() => setPending(r.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            {data.resources.filter((r) =>
              r.title.toLowerCase().includes(query.toLowerCase()),
            ).length === 0 && (
              <div className="admin-empty">
                <FileText />
                <h3>No resources found</h3>
                <p>Try another search or add a PDF.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      {pending && (
        <Modal
          title="Delete this PDF resource?"
          onClose={() => setPending(null)}
        >
          <p>
            The resource and its file will be removed from this device’s
            library.
          </p>
          <div className="modal-actions">
            <button onClick={() => setPending(null)}>Cancel</button>
            <button
              className="button"
              onClick={async () => {
                try {
                  await deleteResource(pending);
                  setPending(null);
                  if (editing?.id === pending) reset();
                } catch (e) {
                  setError((e as Error).message);
                  setPending(null);
                }
              }}
            >
              Delete Resource
            </button>
          </div>
        </Modal>
      )}
    </AdminShell>
  );
}
