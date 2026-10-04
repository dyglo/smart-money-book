# Admin workspace (mock backend)

## Access

- `/admin/sign-up`: create one device-local demo account.
- `/admin/login` or `/login`: sign in.
- `/admin/dashboard`: overview and post management.
- `/admin/editor`: write a new post; `?id=...` opens an existing one.
- `/admin/resources`: upload and manage PDF resources.

Demo credentials: `admin@smartmoneybook.demo` / `SmartMoney2026!`.

These are deliberately public demo credentials. The client-side route gate and session are not production authorization. Do not use this version to protect confidential material. Demo accounts are device-local, password hashes are stored in browser storage, and sessions live in sessionStorage.

## Content workflow

The overview shows actual counts of local posts and tutorials, plus clearly labeled sample visitor and view figures. The sidebar collapses to accessible icon links on desktop and opens as a drawer on phones.

The Tiptap editor supports headings 1–3, bold, italic, underline, strikethrough, highlight, bullet/numbered lists, quotes, alignment, horizontal rules, tables, images, undo, and redo. Select text and use the toolbar. Paste image files directly from the clipboard, drag an image into the canvas, or choose an inline image file. Cover upload is separate. Images are limited to 5 MB. Drafts require an explicit save; navigation away from unsaved edits prompts before discarding them.

Publish requires a title, nonempty text content, and an explicit Blog/Tutorial selection for a new post. Published previews appear in the corresponding public index and resource search on this browser. `/read?id=...` uses the site’s article layout and sanitized rich content. Draft previews require a demo session. Existing sample tutorials retain their original presentation until edited. Resources can be edited, hidden, shown, downloaded, and deleted.

## PDF import

PDF.js processes files locally. Import appends to the current document and does not upload files to a service.

- Maximum PDF size: 15 MB; up to the first 20 pages.
- Text lines become editable paragraphs or candidate headings.
- Up to six supported embedded raster images per page are extracted and placed after the corresponding page’s text.
- Unsupported image encodings can fall back to page illustrations.
- Image-only/scanned PDFs are imported as images and explicitly flagged as requiring OCR for editable text. OCR is not implemented.
- Reading order, columns, tables, vector diagrams, typography, and exact PDF positioning are not guaranteed; review every imported draft before publishing.
- Encrypted or malformed PDFs can fail with a visible error.

The matching PDF worker is copied from the installed pdfjs-dist package during installation/build; it is generated and ignored by Git.

## Storage and backend boundary

`components/workspace-provider.tsx` provides the mock data interface. IndexedDB stores posts, HTML, cover images, and PDF Blobs in `smb-workspace-v1`. Temporary object URLs are used for downloads and revoked when no longer needed. Browser storage failures are visible.

Mock publishing is not global publishing. Changes do not synchronize between phones, PCs, browser profiles, or other visitors. New visitors see the seed records. A future backend will replace this provider with authenticated content operations, durable shared storage, authorization rules, and genuine analytics.
