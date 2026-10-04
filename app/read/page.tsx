import { PublishedPost } from "@/components/published-post";
export const metadata = {
  title: "Post preview",
  robots: { index: false, follow: false },
};
export default function Read() {
  return <PublishedPost />;
}
