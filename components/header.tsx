"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
export function Header() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const path = usePathname();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        <div>
          <span>
            ✨ <strong>Update:</strong> Explore my ICT trading strategies and
            PDF study books.
          </span>
          <Link className="button" href="/books">
            Download Now
          </Link>
        </div>
      </div>
      <header className="site-header">
        <div className="nav-inner">
          <Link className="brand" href="/" aria-label="Smart Money Book home">
            <span className="brand-mark">S</span>
            <span>
              Smart Money
              <br />
              <small>BOOK</small>
            </span>
          </Link>
          <nav
            className={open ? "navigation open" : "navigation"}
            aria-label="Main navigation"
          >
            {[
              ["Home", "/"],
              ["Blog", "/blog"],
              ["ICT Tutorials", "/tutorials"],
              ["Market Structure", "/market-structure"],
              ["Resources", "/resources"],
              ["eBook", "/books"],
            ].map(([label, url]) => (
              <Link
                key={url}
                href={url}
                aria-current={path === url ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              aria-label="Search resources"
              aria-expanded={search}
              onClick={() => setSearch(!search)}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path d="m15 15 6 6" stroke="currentColor" strokeWidth="3" />
              </svg>
            </button>
            <button
              className="menu-toggle"
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              ☰
            </button>
          </div>
        </div>
        {search && (
          <form className="header-search" action="/resources">
            <label htmlFor="header-query">Search the library</label>
            <input
              id="header-query"
              name="q"
              placeholder="Search books, checklists, tutorials…"
              autoFocus
            />
            <button className="button">Search</button>
          </form>
        )}
      </header>
    </>
  );
}
