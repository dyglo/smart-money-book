"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { adminSession, loadWorkspace, writePost, writeResource, emptyAnalytics, ADMIN_EMAIL, visitorId, type AdminSession, type Analytics } from "@/lib/backend";
import type { Workspace, ManagedPost, ManagedResource } from "@/lib/workspace";

type Context = {
  data: Workspace; ready: boolean; error: string; session: AdminSession | null; analytics: Analytics;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  savePost: (post: ManagedPost) => Promise<ManagedPost>;
  deletePost: (id: string) => Promise<void>;
  saveResource: (r: ManagedResource) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
};
const WorkspaceContext = createContext<Context | null>(null);
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Workspace>({ posts: [], resources: [] });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<AdminSession | null>(null);
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const generation = useRef(0);
  const path = usePathname();
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    try {
      const admin = await adminSession();
      const result = await loadWorkspace(Boolean(admin));
      if (current !== generation.current) return;
      setSession(admin);
      setData(result.workspace);
      setAnalytics(result.analytics);
      setError("");
    } catch (e) {
      if (current !== generation.current) return;
      setError(e instanceof Error ? e.message : "Unable to load the library. Please try again.");
      setSession(null);
      setData({ posts: [], resources: [] });
    } finally {
      if (current === generation.current) setReady(true);
    }
  }, []);
  useEffect(() => {
    void refresh();
    let timer: ReturnType<typeof setTimeout>;
    const { data: { subscription } } = supabase().auth.onAuthStateChange(() => {
      // Supabase auth callbacks must return before making additional auth calls.
      clearTimeout(timer);
      timer = setTimeout(() => void refresh(), 0);
    });
    const focus = () => void refresh();
    window.addEventListener("focus", focus);
    const interval = setInterval(focus, 30 * 60 * 1000);
    return () => { generation.current++; clearTimeout(timer); clearInterval(interval); subscription.unsubscribe(); window.removeEventListener("focus", focus); };
  }, [refresh]);
  useEffect(() => {
    void refresh();
    if (!path.startsWith("/admin")) {
      try { void supabase().rpc("record_visit", { p_visitor: visitorId(), p_path: path }); } catch { /* Analytics must not block reading. */ }
    }
  }, [path, refresh]);
  async function signOut() {
    const { error } = await supabase().auth.signOut();
    if (error) throw error;
    setSession(null);
    // Immediately discard cached drafts and hidden resources.
    setData({ posts: [], resources: [] });
    await refresh();
  }
  return <WorkspaceContext.Provider value={{ data, ready, error, session, analytics,
    signIn: async (email, password) => {
      const { error } = await supabase().auth.signInWithPassword({ email, password });
      if (error) throw error;
      const admin = await adminSession();
      if (!admin) { await signOut(); throw new Error("Your account requires email verification and administrator approval before accessing the workspace."); }
      await refresh();
    },
    signUp: async (name, email, password) => {
      if (email !== ADMIN_EMAIL) throw new Error("Registration is restricted to tafartechlabs@gmail.com.");
      const { data, error } = await supabase().auth.signUp({ email, password, options: { data: { name } } });
      if (error) throw error;
      if (!data.user || data.user.identities?.length === 0) throw new Error("Registration is closed. Sign in with the existing account.");
      if (data.session) await signOut();
    },
    signOut,
    savePost: async post => { const saved = await writePost(post); await refresh(); return saved; },
    deletePost: async id => {
      const { data: deleted, error } = await supabase().from("posts").delete().eq("id", id).select("id");
      if (error) throw error;
      if (!deleted?.length) throw new Error("Post could not be deleted. Check your administrator access.");
      const { data: images } = await supabase().storage.from("images").list(id, { limit: 1000 });
      if (images?.length) {
        const { error: cleanup } = await supabase().storage.from("images").remove(images.map(image => `${id}/${image.name}`));
        if (cleanup) console.error("Deleted post image cleanup failed", cleanup.message);
      }
      await refresh();
    },
    saveResource: async r => { await writeResource(r); await refresh(); },
    deleteResource: async id => {
      const resource = data.resources.find(r => r.id === id);
      const { data: deleted, error } = await supabase().from("resources").delete().eq("id", id).select("id");
      if (error) throw error;
      if (!deleted?.length) throw new Error("Resource could not be deleted. Check your administrator access.");
      if (resource?.storagePath) {
        const { error: cleanup } = await supabase().storage.from("resources").remove([resource.storagePath]);
        if (cleanup) console.error("Deleted PDF cleanup failed", cleanup.message);
      }
      await refresh();
    }
  }}>{children}</WorkspaceContext.Provider>;
}
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("WorkspaceProvider is missing");
  return value;
}
