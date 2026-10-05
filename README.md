# Smart Money Book

Next.js publishing app backed by the Supabase project **smartmoney-book** (`tikmonmvozelytbzerfq`). Posts, PDFs, images, comments, authentication, and dashboard metrics use the live backend. The library starts empty; add your own content from the existing admin dashboard.

## Local setup

Requires Node.js 22.13 or newer.

```bash
npm ci
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project's API keys. The project URL is already specified. This workspace has `.env.local` configured. These two public variables are also configured in the connected Vercel project for production, preview, and development; the next deployment will use them. Never put a secret or service-role key in a `NEXT_PUBLIC_` variable.

```bash
npm run dev
```

Open http://localhost:3000. For production, run `npm run build` and `npm run start`.

## Administrator

1. Open `/admin/sign-up` and register **tafartechlabs@gmail.com** with your own password.
2. Verify the email sent by Supabase.
3. The Supabase project owner approves the account using the SQL in [docs/admin-workspace.md](docs/admin-workspace.md).
4. Sign in at `/admin/login` and publish content.

Registration is enforced by an `auth.users` trigger and an atomic singleton claim. Other emails cannot register. Once claimed, registration remains closed, including after account deletion. Approval lives in a private table that browser users cannot modify. Email verification and approval are required by every admin RLS policy.

## Content

The existing editor supports rich text, tables, inline/cover images, drafts, publishing, editing, and deletion. PDF import processes up to 20 pages locally; extracted text and images are saved to Supabase when you save the document. Scanned pages require OCR for editable text. PDF resources support upload, edit, hide, publish, download, and delete.

Tutorials, blog lists, the homepage, resource search, and sidebar read shared live content. Drafts and hidden resources are visible only to the approved administrator. Both storage buckets are private; published media can be downloaded through signed URLs. Comments persist in Supabase.

Dashboard visitors measure distinct browser IDs over seven days in Africa/Nairobi time. Content views count a browser/post/path once per day. These are first-party visit measurements rather than audited unique people.

## Database and verification

Schema migrations are in `supabase/migrations/` and have been applied to the connected project. Do not reapply them to that project. `supabase/tests/backend.sql` verifies signup, approval/revocation, RLS, CRUD, comments, and analytics; `supabase/tests/storage.sql` verifies media authorization. Both run inside transactions that roll back all fixtures. Run it through Supabase SQL Editor only while the admin slot is unclaimed.

```bash
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Browser tests cover desktop/mobile navigation, unauthorized access, invalid credentials, email restrictions, and live public reads. Optional fixture tests use `SMB_TEST_PUBLIC_SLUG`. The approved-admin publishing test requires `SMB_TEST_ADMIN_PASSWORD`; it is skipped until the owner has created, verified, and approved the account. Never commit this password.

The chart diagrams remain illustrative educational visuals. They do not represent live market prices.
