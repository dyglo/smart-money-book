import { notFound } from "next/navigation";
import { articles } from "@/lib/content";
import { SeedPost } from "@/components/published-post";
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  return {
    title: a?.title ?? "Tutorial not found",
    description: a?.description,
  };
}
export default async function Tutorial({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  if (!a) notFound();
  return <SeedPost article={a} />;
}
