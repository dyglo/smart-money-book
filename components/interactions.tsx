"use client";
import { useState } from "react";
export function ShareButtons() {
  const [status, setStatus] = useState("");
  return (
    <div className="share-row">
      <button
        className="share-facebook"
        onClick={() =>
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`,
            "_blank",
            "noopener,noreferrer",
          )
        }
      >
        f <span>Facebook</span>
      </button>
      <button
        className="share-x"
        onClick={() =>
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}`,
            "_blank",
            "noopener,noreferrer",
          )
        }
      >
        𝕏 <span>X</span>
      </button>
      <button
        className="share-copy"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(location.href);
            setStatus("Link copied");
          } catch {
            setStatus("Copy the page URL from your browser");
          }
        }}
      >
        Copy Link
      </button>
      <span role="status">{status}</span>
    </div>
  );
}
export function Comments() {
  const [posted, setPosted] = useState<{ name: string; text: string }[]>([]);
  return (
    <section className="comments">
      <h2>Discussion</h2>
      <div className="comment">
        <strong>Alex · Sample comment</strong>
        <p>
          The step-by-step checklist makes it easier to keep my chart studies
          consistent.
        </p>
      </div>
      {posted.map((c, i) => (
        <div className="comment" key={i}>
          <strong>{c.name} · Preview comment</strong>
          <p>{c.text}</p>
        </div>
      ))}
      <h2>Leave a Reply</h2>
      <p className="muted">
        Preview discussion: replies stay on this page until you refresh. Nothing
        is submitted to a server.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = new FormData(form);
          setPosted([
            ...posted,
            {
              name: String(data.get("name")).trim(),
              text: String(data.get("comment")).trim(),
            },
          ]);
          form.reset();
        }}
      >
        <label htmlFor="comment">Comment *</label>
        <textarea id="comment" name="comment" required minLength={3} rows={5} />
        <label htmlFor="name">Name *</label>
        <input id="name" name="name" required pattern=".*\S.*" maxLength={80} />
        <button className="button">Post Preview Comment</button>
      </form>
    </section>
  );
}
