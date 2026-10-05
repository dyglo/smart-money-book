# Backend validation — October 5, 2026

- Production build and TypeScript pass.
- Supabase security and performance advisors return no findings.
- Live database transaction tests pass: restricted email, atomic single signup, permanent lock after deletion, approval, immediate revocation, public/draft visibility, post/resource CRUD, persistent comments, and daily visit deduplication.
- Storage transaction tests pass: approved-admin file writes, public published-file reads, hidden PDFs and draft-image isolation, denial after unpublishing, and blocked anonymous uploads.
- Desktop and mobile browser suite: **16 passed, 2 skipped**. Verified navigation/layout, unknown tutorial 404, admin redirects, rejected demo credentials, disallowed signup email, shared published database content, and comments surviving refresh and appearing in independent browser contexts.
- Both skipped cases require the owner-created, verified, approved admin account. Actual successful email delivery/sign-in with that account and full admin browser publishing/upload flows remain to be exercised after registration. Database authorization and CRUD were verified using rolled-back Auth fixtures without consuming the one-time account slot.
- Agent-browser checked the rendered homepage, login, and a temporary live tutorial; no browser page errors were reported.
- All temporary content and transaction-created accounts/files were removed or rolled back. The admin slot remains unclaimed, and the live library contains no seeded sample content.
- Local Supabase public environment variables and Vercel production/preview/development environment variables are configured. Production deployment is triggered by pushing the validated changes to main.

Tests are in `tests/` and `supabase/tests/`. Use `SMB_TEST_PUBLIC_SLUG` for a temporary published browser fixture and `SMB_TEST_ADMIN_PASSWORD` after the real administrator has been onboarded. SQL tests must be run only before the signup slot is claimed; they roll back all database changes. Storage tests verify metadata authorization, not the binary Storage upload service.

See `docs/admin-workspace.md` for owner approval, Auth URL configuration, file URL lifetime, PDF import limits, and metric definitions.
