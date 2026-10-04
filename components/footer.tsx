import Link from "next/link";
export function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <Link className="footer-brand" href="/">
          Smart Money Book
        </Link>
        <p>ICT trading tutorials, strategy notes, and educational resources.</p>
        <nav aria-label="Footer navigation">
          <Link href="/tutorials">Tutorials</Link>
          <Link href="/books">PDF Books</Link>
          <Link href="/resources">Resources</Link>
        </nav>
        <p className="disclaimer">
          For educational purposes only. Trading involves risk. Examples are
          illustrative and are not financial advice.
        </p>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Smart Money Book. All rights reserved.
      </div>
    </footer>
  );
}
