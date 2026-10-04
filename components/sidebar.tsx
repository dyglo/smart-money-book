import Link from "next/link";
import { articles } from "@/lib/content";
export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Learning resources">
      <div className="sidebar-inner">
        <div className="book-widget">
          <span className="widget-icon" aria-hidden="true">
            ▥
          </span>
          <h2>
            Smart Money Trading
            <br />
            Playbook
          </h2>
          <p>Study ICT concepts, one lesson at a time.</p>
          <p>Your practical trading companion.</p>
          <Link className="button rust" href="/books">
            Explore the Book
          </Link>
        </div>
        <Link href="/resources" className="library-tile">
          <span aria-hidden="true">SMB</span>
          <strong>Your trading resource library</strong>
        </Link>
        <div className="glossary-widget">
          <p>The Essential</p>
          <h2>ICT Glossary PDF</h2>
          <p>
            <strong>Build your vocabulary</strong> with a collection of trading
            terms, concepts, and study notes.
          </p>
          <a className="button" href="/pdfs/ict-glossary.pdf" download>
            Download Free PDF
          </a>
          <small>Sample edition · PDF</small>
        </div>
        <div className="sidebar-section">
          <h2>Latest Tutorials</h2>
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/tutorials/${a.slug}`}
              className="latest-link"
            >
              <span>{a.category}</span>
              <strong>{a.title.split(" — ")[0]}</strong>
              <small>{a.readTime}</small>
            </Link>
          ))}
        </div>
        <div className="ebook-widget">
          <span className="eyebrow">STUDY. PLAN. REVIEW.</span>
          <h2>Build a repeatable trading process.</h2>
          <p>Books, strategy notes, and printable worksheets in one place.</p>
          <Link className="button" href="/resources">
            Browse Resources
          </Link>
        </div>
      </div>
    </aside>
  );
}
