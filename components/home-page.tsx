"use client";
import Link from "next/link";
import { useWorkspace } from "./workspace-provider";
import { postURL } from "@/lib/workspace";
import { SetupStudy } from "@/components/setup-study";

const learningPath = [
  {
    number: "01",
    label: "Understand the structure",
    text: "Start with displacement and fair value gaps. Give every price move a little more context.",
    href: "/market-structure",
    link: "Study market structure",
    icon: "structure",
  },
  {
    number: "02",
    label: "Study the setup",
    text: "Connect liquidity, order blocks, and confirmation with step-by-step strategy notes.",
    href: "/tutorials",
    link: "Explore ICT tutorials",
    icon: "chart",
  },
  {
    number: "03",
    label: "Build your process",
    text: "Take the checklist to your chart. Record your reasoning, then review what happened.",
    href: "/resources?q=checklist",
    link: "Get the checklist",
    icon: "book",
  },
];

export function HomePage() {
  const { data } = useWorkspace();
  const articles = data.posts.filter(p => p.status === "published" && p.kind === "tutorial").slice(0, 3);
  const resources = data.resources.filter(r => r.published).slice(0, 4);
  return (
    <main id="main" className="home-page">
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="home-shell hero-grid">
          <div className="hero-copy">
            <span className="home-eyebrow">
              <span className="eyebrow-line" /> THE TRADER’S STUDY DESK
            </span>
            <h1 id="hero-title">
              Read price.
              <br />
              Build your <span>process.</span>
            </h1>
            <p>
              Make sense of the chart with ICT strategy guides, clear examples,
              and trading resources you can keep.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/tutorials">
                Explore the Tutorials
              </Link>
              <Link className="button button-outline" href="/books">
                Browse PDF Books
              </Link>
            </div>
            <div className="hero-footnote">
              <span className="small-book-icon" aria-hidden="true">
                ▤
              </span>
              <span>Learn at your pace. Put the ideas into practice.</span>
            </div>
          </div>
          <SetupStudy />
        </div>
      </section>
      <div className="home-topics">
        <div className="home-shell">
          <span>BUILT AROUND PRICE ACTION</span>
          <Link href="/market-structure">Market structure</Link>
          <span className="topic-divider">/</span>
          <Link href="/tutorials">Liquidity</Link>
          <span className="topic-divider">/</span>
          <Link href="/tutorials">Order blocks</Link>
          <span className="topic-divider">/</span>
          <Link href="/market-structure">Fair value gaps</Link>
        </div>
      </div>
      <section
        className="home-shell home-section learning-section"
        aria-labelledby="path-title"
      >
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">A CLEAR PLACE TO START</span>
            <h2 id="path-title">From concept to chart.</h2>
          </div>
          <p>
            A simple path through the library.
            <br />
            Start with the foundations and build from there.
          </p>
        </div>
        <div className="learning-grid">
          {learningPath.map((step) => (
            <article className="learning-card" key={step.number}>
              <div className="learning-card-top">
                <span className="learning-icon" aria-hidden="true">
                  {step.icon === "structure" ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M4 18V8m8 10V4m8 14V10M1 8h6m2-4h6m2 6h6" />
                    </svg>
                  ) : step.icon === "chart" ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M3 3v18h18M6 15l5-5 4 3 6-8" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="M4 3h16v18H4zM8 8h8m-8 4h8m-8 4h5" />
                    </svg>
                  )}
                </span>
                <span className="step-number">{step.number}</span>
              </div>
              <h3>{step.label}</h3>
              <p>{step.text}</p>
              <Link href={step.href}>{step.link}</Link>
            </article>
          ))}
        </div>
      </section>
      <section
        className="home-shell home-section"
        aria-labelledby="latest-title"
      >
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">THE STRATEGY NOTEBOOK</span>
            <h2 id="latest-title">A closer look at price.</h2>
          </div>
          <Link className="section-link" href="/tutorials">
            View all tutorials <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="home-lesson-grid">
          {articles.map((article, i) => (
            <article className="home-lesson" key={article.id}>
              <Link
                className={`lesson-art lesson-art-${i}`}
                href={postURL(article)}
                aria-label={`Read ${article.title}`}
              >
                <span className="lesson-art-label">
                  ICT CONCEPT / {String(i + 1).padStart(2, "0")}
                </span>
                <MiniDiagram type={i} />
                <span className="lesson-art-title">
                  {article.title.split(" — ")[0]}
                </span>
              </Link>
              <div className="home-lesson-body">
                <div className="lesson-meta">
                  <span>{article.kind === "tutorial" ? "ICT Tutorial" : "Strategy Blog"}</span>
                  <span>{`${Math.max(1, Math.ceil(article.html.replace(/<[^>]*>/g, " ").split(/\s+/).length / 200))} min read`}</span>
                </div>
                <h3>
                  <Link href={postURL(article)}>
                    {article.title.split(" — ")[0]}
                  </Link>
                </h3>
                <p>{article.description}</p>
                <Link
                  className="lesson-read"
                  href={postURL(article)}
                >
                  Read the guide <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section
        className="home-shell home-section"
        aria-labelledby="toolkit-title"
      >
        <div className="toolkit-panel">
          <div className="toolkit-copy">
            <span className="home-eyebrow">LESS SCROLLING. MORE STUDYING.</span>
            <h2 id="toolkit-title">
              Your next study session,
              <br />
              all in one place.
            </h2>
            <p>
              Keep the concepts close. Download a PDF, use a worksheet, and
              bring a little more structure to your chart time.
            </p>
            <Link className="button button-dark" href="/resources">
              Open the Resource Library
            </Link>
          </div>
          <div className="toolkit-resources">
            {resources
              .filter((r) => r.category !== "Books")
              .map((r, i) => (
                <a
                  href={r.url}
                  download
                  className="toolkit-resource"
                  key={r.slug}
                >
                  <span className="pdf-icon" aria-hidden="true">
                    PDF
                  </span>
                  <span>
                    <strong>{r.title}</strong>
                    <small>{r.category} · PDF</small>
                  </span>
                  <span className="download-icon" aria-hidden="true">
                    ↓
                  </span>
                </a>
              ))}
          </div>
        </div>
      </section>
      <section className="home-shell home-closing">
        <span className="home-eyebrow">THE SMART MONEY BOOK APPROACH</span>
        <h2>
          Study the why.
          <br />
          Plan the how. Review the result.
        </h2>
        <p>A place for thoughtful trading education, one concept at a time.</p>
        <Link href="/blog" className="section-link">
          Open the strategy notebook <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  );
}
function MiniDiagram({ type }: { type: number }) {
  return (
    <svg className="mini-diagram" viewBox="0 0 360 110" aria-hidden="true">
      <path
        d="M10 90H350M10 55H350M10 20H350"
        stroke="currentColor"
        opacity=".1"
      />
      {type === 0 ? (
        <>
          <rect
            x="100"
            y="43"
            width="210"
            height="22"
            fill="currentColor"
            opacity=".17"
          />
          <path
            d="M20 25l35 35 25-18 35 47 30-20 30 13 40-48 30 23 45-40 30 12"
            stroke="currentColor"
            fill="none"
            strokeWidth="3"
          />
          <path d="M100 43H310" stroke="currentColor" strokeDasharray="5 5" />
        </>
      ) : type === 1 ? (
        <>
          <rect
            x="115"
            y="37"
            width="200"
            height="33"
            fill="currentColor"
            opacity=".17"
          />
          {[75, 105, 135, 165, 195, 225, 255, 285].map((x, i) => (
            <g key={x}>
              <path
                d={`M${x} ${80 - i * 8}v-36`}
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x={x - 6}
                y={56 - i * 8}
                width="12"
                height="19"
                fill="currentColor"
              />
            </g>
          ))}
        </>
      ) : (
        <>
          <path d="M20 35H335" stroke="currentColor" strokeDasharray="5 5" />
          <path
            d="M15 80l35-10 30-24 28 14 37-12 27 15 37-45 33 62 25-15 33 26 32-10"
            stroke="currentColor"
            fill="none"
            strokeWidth="3"
          />
          <circle
            cx="209"
            cy="18"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </>
      )}
    </svg>
  );
}
