import { PublishedPost } from "@/components/published-post";
import { Suspense } from "react";
export const metadata = {
  title: "Post preview",
  robots: { index: false, follow: false },
};
export default function Read() {
  return <Suspense fallback={<div className="foundation" role="status">Opening post…</div>}><PublishedPost /></Suspense>;
}
