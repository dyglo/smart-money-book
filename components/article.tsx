import Link from "next/link";
import type { Article } from "@/lib/content";
import { articles, faqs } from "@/lib/content";
import { Chart } from "./chart";
import { Sidebar } from "./sidebar";
import { ShareButtons, Comments } from "./interactions";
export function ArticleView({ article }: { article: Article }) {
  return (
    <main id="main" className="content-grid">
      <article className="article-panel">
        <div className="update-callout">
          ✨ <strong>Update:</strong> My ICT study books and strategy resources
          are here! Explore the{" "}
          <Link href="/books">Smart Money Book library</Link>.
        </div>
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>»</span>
          <Link href="/tutorials">{article.category}</Link>
          <span className="desktop-crumb">» {article.title}</span>
        </div>
        <h1>{article.title}</h1>
        <div className="article-meta">
          <span>◉ Smart Money Book</span>
          <span>· {article.date}</span>
          <span>Last Updated: October 4, 2026</span>
          <span>{article.readTime}</span>
        </div>
        <ShareButtons />
        <Chart cover title={article.title.split(" — ")[0]} />
        <div className="book-promo">
          <div>
            <h2>Smart Money Trading Playbook</h2>
            <p>
              Market structure, liquidity, and a clear process for your next
              study session.
            </p>
            <Link href="/books" className="light-button">
              Explore the PDF Book
            </Link>
          </div>
          <div className="mini-book">
            SMART
            <br />
            MONEY
            <br />
            <b>BOOK</b>
            <small>ICT STUDY GUIDE</small>
          </div>
        </div>
        <div className="article-content">
          <p>{article.description}</p>
          <p>
            This guide is part of the{" "}
            <Link href="/tutorials">ICT trading tutorials</Link> library. Build
            your understanding step by step, save the study notes, and use the
            checklist to review your own examples.
          </p>
          <details className="toc" open>
            <summary>
              Table of Contents <span>Toggle</span>
            </summary>
            <ol>
              {article.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.title}</a>
                </li>
              ))}
            </ol>
          </details>
          {article.sections.map((section) => (
            <section
              id={section.id}
              className="lesson-section"
              key={section.id}
            >
              <h2>{section.title}</h2>
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {section.points && (
                <ol>
                  {section.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
              )}
              {section.chart && <Chart direction={section.chart} />}{" "}
              {section.id === "pdf-download" && (
                <div className="download-box">
                  <div>
                    <strong>{article.title.split(" — ")[0]}</strong>
                    <span>Sample study guide · PDF</span>
                  </div>
                  <a
                    className="button"
                    download
                    href={`/pdfs/${article.slug}.pdf`}
                  >
                    Download PDF
                  </a>
                </div>
              )}
              {section.id === "faqs" &&
                faqs.map(([q, a]) => (
                  <details className="faq" key={q}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
            </section>
          ))}
        </div>
        <div className="author-box">
          <span className="author-avatar">SMB</span>
          <div>
            <h3>Smart Money Book</h3>
            <p>
              Sharing structured ICT study notes, trading strategies, and
              resources to help you build your own learning process.
            </p>
          </div>
        </div>
        <section className="related">
          <h2>Related Tutorials</h2>
          <div>
            {articles
              .filter((a) => a.slug !== article.slug)
              .map((a) => (
                <Link key={a.slug} href={`/tutorials/${a.slug}`}>
                  <span>{a.category}</span>
                  <h3>{a.title}</h3>
                  <small>{a.readTime}</small>
                </Link>
              ))}
          </div>
        </section>
        <Comments />
      </article>
      <Sidebar />
    </main>
  );
}
