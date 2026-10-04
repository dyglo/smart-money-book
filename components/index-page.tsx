import Link from "next/link";
import { articles } from "@/lib/content";
import { Sidebar } from "./sidebar";
export function IndexPage({
  title,
  description,
  marketOnly = false,
}: {
  title: string;
  description: string;
  marketOnly?: boolean;
}) {
  const list = marketOnly
    ? articles.filter((a) => a.category === "Market Structure")
    : articles;
  return (
    <main id="main" className="content-grid">
      <section className="article-panel">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>»</span>
          {title}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="article-list">
          {list.map((a, i) => (
            <article className="article-preview" key={a.slug}>
              <Link
                href={`/tutorials/${a.slug}`}
                className={`preview-cover preview-${i}`}
              >
                <span>ICT STUDY NOTES</span>
                <strong>{a.title.split(" — ")[0]}</strong>
                <small>SMART MONEY BOOK</small>
              </Link>
              <div className="category-label">{a.category}</div>
              <h2>
                <Link href={`/tutorials/${a.slug}`}>{a.title}</Link>
              </h2>
              <p className="muted">
                {a.date} · {a.readTime}
              </p>
              <p>{a.description}</p>
              <Link className="text-link" href={`/tutorials/${a.slug}`}>
                Read Tutorial
              </Link>
            </article>
          ))}
        </div>
      </section>
      <Sidebar />
    </main>
  );
}
