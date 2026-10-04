"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import DOMPurify from "dompurify";
import {
  Save,
  Send,
  FileUp,
  ImagePlus,
  Eye,
  X,
  FileText,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { AdminShell } from "./shell";
import { DocumentEditor } from "./document-editor";
import { Modal } from "./modal";
import { useWorkspace } from "../workspace-provider";
import {
  blankPost,
  readImage,
  postURL,
  type ManagedPost,
  type PostKind,
} from "@/lib/workspace";
export function EditorPage() {
  return (
    <AdminShell title="Editor">
      <EditorWorkspace />
    </AdminShell>
  );
}
function EditorWorkspace() {
  const { data, savePost, ready } = useWorkspace();
  const router = useRouter();
  const [post, setPost] = useState<ManagedPost | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [kind, setKind] = useState<PostKind | "">("");
  const [dirty, setDirty] = useState(false);
  const editor = useRef<Editor | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);
  useEffect(() => {
    if (!ready || initialized.current) return;
    initialized.current = true;
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      const found = data.posts.find((p) => p.id === id);
      if (found) {
        setPost({ ...found });
        setKind(
          found.status === "published" || found.kindConfirmed ? found.kind : "",
        );
      } else setError("This post was not found. Start a new document.");
    } else setPost(blankPost());
  }, [ready, data.posts]);
  useEffect(() => {
    function warn(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    function guardNavigation(e: MouseEvent) {
      if (!dirty || !(e.target instanceof Element)) return;
      const anchor = e.target.closest("a[href]") as HTMLAnchorElement | null;
      if (
        !anchor ||
        anchor.href === location.href ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      if (!window.confirm("Leave this document without saving your changes?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    document.addEventListener("click", guardNavigation, true);
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", guardNavigation, true);
    };
  }, [dirty]);
  const register = useCallback((e: Editor) => {
    editor.current = e;
  }, []);
  const update = (patch: Partial<ManagedPost>) => {
    setPost((p) => (p ? { ...p, ...patch } : p));
    setDirty(true);
    setStatus("Unsaved changes");
  };
  async function save(publish = false, toDraft = false) {
    if (!post) return;
    setError("");
    if (
      publish &&
      (!post.title.trim() || !editor.current?.getText().trim() || !kind)
    ) {
      setError(
        "Add a title, write some content, and choose Blog or Tutorial before publishing.",
      );
      return;
    }
    setBusy(true);
    try {
      const next = {
        ...post,
        title: post.title.trim(),
        html: DOMPurify.sanitize(editor.current?.getHTML() ?? post.html),
        kind: kind || post.kind,
        kindConfirmed: Boolean(kind),
        status: publish
          ? ("published" as const)
          : toDraft
            ? ("draft" as const)
            : post.status,
        customized: true,
        updatedAt: new Date().toISOString(),
      };
      await savePost(next);
      setPost(next);
      setDirty(false);
      setStatus(
        publish
          ? "Published to this browser’s website preview."
          : "Saved on this device.",
      );
      setPublishing(false);
      window.history.replaceState(null, "", `/admin/editor?id=${next.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!post)
    return (
      <div className="admin-empty">
        <FileText />
        <h2>Open a document</h2>
        {error && <p role="alert">{error}</p>}
        <button
          className="button"
          onClick={() => {
            setPost(blankPost());
            setError("");
          }}
        >
          New Post
        </button>
      </div>
    );
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">THE EDITOR</span>
          <h1>
            {post.title ? "Your next great lesson." : "Start with an idea."}
          </h1>
          <p>
            Write naturally. Select text to style it. Add your charts as you go.
          </p>
        </div>
        <div className="editor-actions">
          <button
            className="admin-secondary"
            disabled={busy}
            onClick={() => void save()}
          >
            <Save size={16} />
            Save {post.status === "draft" ? "Draft" : "Changes"}
          </button>
          <button
            className="button"
            disabled={busy}
            onClick={() => {
              setError("");
              setPublishing(true);
            }}
          >
            <Send size={16} />
            {post.status === "published" ? "Publish Changes" : "Publish"}
          </button>
        </div>
      </div>
      <div className="editor-workspace">
        <div className="editor-primary">
          <div className="editor-title-block">
            <input
              className="post-title-input"
              aria-label="Post title"
              placeholder="Give your lesson a title…"
              value={post.title}
              onChange={(e) => update({ title: e.target.value })}
            />
            <input
              className="post-description-input"
              aria-label="Post summary"
              placeholder="A short summary for your readers…"
              value={post.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>
          {error && !publishing && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
          {status && (
            <p className="editor-save-status" role="status">
              {status}
            </p>
          )}
          <DocumentEditor
            key={post.id}
            html={post.html}
            onChange={(html) => update({ html })}
            onError={setError}
            register={register}
          />
        </div>
        <aside className="editor-inspector">
          <section className="admin-card">
            <h2>Cover image</h2>
            <p>Your post’s first impression.</p>
            {post.cover ? (
              <div className="cover-preview">
                <img src={post.cover} alt="Post cover preview" />
                <button
                  aria-label="Remove cover"
                  onClick={() => update({ cover: "" })}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                className="cover-upload"
                onClick={() => coverInput.current?.click()}
              >
                <ImagePlus size={28} />
                <strong>Upload a cover</strong>
                <span>PNG, JPEG, WebP · up to 5 MB</span>
              </button>
            )}
            <input
              ref={coverInput}
              type="file"
              hidden
              accept="image/png,image/jpeg,image/webp,image/gif"
              aria-label="Cover image file"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f)
                  try {
                    update({ cover: await readImage(f) });
                  } catch (e) {
                    setError((e as Error).message);
                  }
              }}
            />
            {post.cover && (
              <button
                className="inspector-link"
                onClick={() => coverInput.current?.click()}
              >
                Change cover image
              </button>
            )}
          </section>
          <section className="admin-card">
            <h2>Import a PDF</h2>
            <p>
              Bring an existing lesson into your document as editable text and
              images.
            </p>
            <button
              className="admin-secondary"
              disabled={busy}
              onClick={() => pdfInput.current?.click()}
            >
              <FileUp size={17} />
              Choose a PDF
            </button>
            <input
              ref={pdfInput}
              type="file"
              hidden
              accept="application/pdf,.pdf"
              aria-label="Import PDF file"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy(true);
                setError("");
                try {
                  const { importPDF } = await import("@/lib/pdf-import");
                  const result = await importPDF(file, setStatus);
                  if (!editor.current)
                    throw new Error("The editor is still loading. Try again.");
                  editor.current
                    .chain()
                    .focus("end")
                    .insertContent(result.html)
                    .run();
                  if (!post.title)
                    update({ title: file.name.replace(/\.pdf$/i, "") });
                  setStatus(result.message);
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Could not import this PDF. It may be encrypted or damaged.",
                  );
                  setStatus("");
                } finally {
                  setBusy(false);
                }
              }}
            />
            <small>
              Up to 15 MB, first 20 pages. Imported content is appended. Scanned
              pages need OCR for editable text.
            </small>
          </section>
          <section className="admin-card">
            <h2>Document</h2>
            <div className="inspector-meta">
              <span>Status</span>
              <span className={`status-chip ${post.status}`}>
                {post.status}
              </span>
            </div>
            {post.status === "published" && (
              <button
                className="inspector-link"
                disabled={busy}
                onClick={() => void save(false, true)}
              >
                <FileText size={16} />
                Move to draft
              </button>
            )}
            <p className="inspector-help">
              Save before opening your website preview.
            </p>
            <Link className="inspector-link" href={postURL(post)}>
              <Eye size={16} />
              Preview saved post
            </Link>
            <button
              className="inspector-link"
              onClick={() => {
                if (
                  dirty &&
                  !confirm(
                    "Start a new document? Unsaved changes will be lost.",
                  )
                )
                  return;
                setPost(blankPost());
                setKind("");
                setDirty(false);
                setStatus("");
                editor.current = null;
                window.history.replaceState(null, "", "/admin/editor");
              }}
            >
              <Plus size={16} />
              New document
            </button>
          </section>
        </aside>
      </div>
      {publishing && (
        <Modal
          title="Ready to share this lesson?"
          onClose={() => setPublishing(false)}
        >
          <p>
            Choose where readers will find it. Publishing creates a preview on
            this device.
          </p>
          <fieldset className="publish-kind">
            <legend>Publish as *</legend>
            {(["blog", "tutorial"] as const).map((k) => (
              <label key={k}>
                <input
                  type="radio"
                  name="post-kind"
                  checked={kind === k}
                  onChange={() => setKind(k)}
                />
                <span>
                  <strong>{k === "blog" ? "Blog post" : "Tutorial"}</strong>
                  <small>
                    {k === "blog"
                      ? "Strategy notes and perspectives"
                      : "Step-by-step educational lessons"}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          {error && (
            <p role="alert" className="admin-error">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button onClick={() => setPublishing(false)} disabled={busy}>
              Keep Editing
            </button>
            <button
              className="button"
              disabled={busy}
              onClick={() => void save(true)}
            >
              {busy ? "Publishing…" : "Publish to Preview"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
