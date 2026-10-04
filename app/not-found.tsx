import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="foundation">
      <h1>Resource not found</h1>
      <p>This page is not in the library.</p>
      <Link href="/resources">Browse resources</Link>
    </main>
  );
}
