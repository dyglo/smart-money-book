import Link from "next/link";
import { Library } from "@/components/library";
import { Sidebar } from "@/components/sidebar";
export const metadata = {
  title: "Trading Resources",
  description:
    "Search ICT books, trading checklists, worksheets, and tutorials.",
};
export default async function Resources({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <main id="main" className="content-grid">
      <section className="article-panel">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>»</span>Resources
        </div>
        <h1>Trading Resources</h1>
        <p>
          Books, study notes, and practical worksheets for your ICT learning
          journey.
        </p>
        <Library initialQuery={typeof q === "string" ? q : ""} />
      </section>
      <Sidebar />
    </main>
  );
}
