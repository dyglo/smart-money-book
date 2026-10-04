import Link from "next/link";
import { Library } from "@/components/library";
import { Sidebar } from "@/components/sidebar";
export const metadata = {
  title: "PDF Books",
  description: "Study books and educational ICT trading PDFs.",
};
export default function Books() {
  return (
    <main id="main" className="content-grid">
      <section className="article-panel">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>»</span>PDF Books
        </div>
        <h1>ICT Trading PDF Books</h1>
        <p>
          Your study companion for market structure, liquidity, and a repeatable
          trading process. Download a book and work through it at your own pace.
        </p>
        <Library booksOnly />
      </section>
      <Sidebar />
    </main>
  );
}
