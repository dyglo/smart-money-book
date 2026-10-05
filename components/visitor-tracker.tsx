"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { recordPageView } from "@/lib/backend";
import { useWorkspace } from "./workspace-provider";

const publicPages = new Set(["/", "/blog", "/tutorials", "/market-structure", "/books", "/resources"]);

export function VisitorTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const { data } = useWorkspace();
  const post = pathname === "/read"
    ? data.posts.find(p => p.id === search.get("id") && p.status === "published")
    : pathname.startsWith("/tutorials/")
      ? data.posts.find(p => `/tutorials/${encodeURIComponent(p.slug || p.id)}` === pathname && p.kind === "tutorial" && p.status === "published")
      : undefined;
  const postId = post?.id ?? null;
  const route = post ? pathname === "/read" ? `/read?id=${post.id}` : `/tutorials/${post.slug || post.id}` : publicPages.has(pathname) ? pathname : null;
  const previousRoute = useRef<string | null>(null);

  useEffect(() => {
    if (!route) { previousRoute.current = null; return; }
    if (previousRoute.current === route) return;
    previousRoute.current = route;
    const eventId = crypto.randomUUID();
    const send = async () => {
      try { await recordPageView(eventId, route, postId); }
      catch {
        // Reuse the event ID so a lost response cannot count the view twice.
        try { await recordPageView(eventId, route, postId); }
        catch (error) { console.error("Visitor tracking failed", error instanceof Error ? error.message : error); }
      }
    };
    void send();
  }, [route, postId]);
  return null;
}
