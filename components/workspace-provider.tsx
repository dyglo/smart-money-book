"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { openDB } from "idb";
import {
  seedWorkspace,
  type Workspace,
  type ManagedPost,
  type ManagedResource,
} from "@/lib/workspace";
type Context = {
  data: Workspace;
  ready: boolean;
  error: string;
  session: { name: string; email: string } | null;
  setSession: (s: Context["session"]) => void;
  savePost: (post: ManagedPost) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  saveResource: (r: ManagedResource) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
};
const WorkspaceContext = createContext<Context | null>(null);
async function database() {
  return openDB("smb-workspace-v1", 1, {
    upgrade(db) {
      db.createObjectStore("workspace");
    },
  });
}
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(seedWorkspace);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [session, updateSession] = useState<Context["session"]>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const db = await database();
        const saved = await db.get("workspace", "content");
        if (active && saved) setData(saved);
        const s = sessionStorage.getItem("smb-demo-session");
        if (active && s) updateSession(JSON.parse(s));
      } catch {
        if (active)
          setError(
            "Device storage is unavailable. Enable browser storage to save changes.",
          );
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const setSession = useCallback((s: Context["session"]) => {
    if (s) sessionStorage.setItem("smb-demo-session", JSON.stringify(s));
    else sessionStorage.removeItem("smb-demo-session");
    updateSession(s);
  }, []);
  async function persist(next: Workspace) {
    try {
      const db = await database();
      await db.put("workspace", next, "content");
      setData(next);
      setError("");
    } catch {
      setError("Could not save to this device. Browser storage may be full.");
      throw new Error(
        "Could not save changes. Check device storage and try again.",
      );
    }
  }
  return (
    <WorkspaceContext.Provider
      value={{
        data,
        ready,
        error,
        session,
        setSession,
        savePost: (post) =>
          persist({
            ...data,
            posts: [post, ...data.posts.filter((p) => p.id !== post.id)],
          }),
        deletePost: (id) =>
          persist({ ...data, posts: data.posts.filter((p) => p.id !== id) }),
        saveResource: (r) =>
          persist({
            ...data,
            resources: [r, ...data.resources.filter((p) => p.id !== r.id)],
          }),
        deleteResource: (id) =>
          persist({
            ...data,
            resources: data.resources.filter((r) => r.id !== id),
          }),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("WorkspaceProvider is missing");
  return value;
}
