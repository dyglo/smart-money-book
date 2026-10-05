import { TutorialPost } from "@/components/published-post";
import { notFound } from "next/navigation";
import { publicTutorial } from "@/lib/public-content";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await publicTutorial(slug);
  return { title: post?.title ?? "Tutorial not found", description: post?.description };
}
export default async function Tutorial({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!await publicTutorial(slug)) notFound();
  return <TutorialPost slug={slug} />;
}
