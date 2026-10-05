"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { visitorId } from "@/lib/backend";
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
export function Comments({ postId }: { postId: string }) {
  const [posted, setPosted] = useState<{ id: string; name: string; text: string }[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setPosted([]);
    supabase().from("comments").select("id,name,text").eq("post_id", postId).order("created_at").then(({ data, error }) => {
      if (!active) return;
      if (error) setError(error.message);
      else setPosted(data ?? []);
    });
    return () => { active = false; };
  }, [postId]);
  return (
    <section className="comments">
      <h2>Discussion</h2>
      {posted.map(c => (
        <div className="comment" key={c.id}>
          <strong>{c.name}</strong>
          <p>{c.text}</p>
        </div>
      ))}
      <h2>Leave a Reply</h2>
      <p className="muted">Share your study notes and questions with other readers.</p>
      <form onSubmit={async e => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        setBusy(true);
        setError("");
        try {
          const { error } = await supabase().rpc("add_comment", { p_post_id: postId, p_name: String(data.get("name")).trim(), p_text: String(data.get("comment")).trim(), p_visitor: visitorId() });
          if (error) throw error;
          const result = await supabase().from("comments").select("id,name,text").eq("post_id", postId).order("created_at");
          if (result.error) throw result.error;
          setPosted(result.data ?? []);
          form.reset();
        } catch(e) { setError(e instanceof Error ? e.message : "Unable to post your comment."); }
        finally { setBusy(false); }
      }}>
        <label htmlFor="comment">Comment *</label>
        <textarea id="comment" name="comment" required minLength={3} maxLength={5000} rows={5} />
        <label htmlFor="name">Name *</label>
        <input id="name" name="name" required pattern=".*\S.*" maxLength={80} />
        {error && <p role="alert" className="admin-error">{error}</p>}
        <button className="button" disabled={busy}>{busy ? "Posting…" : "Post Comment"}</button>
      </form>
    </section>
  );
}
