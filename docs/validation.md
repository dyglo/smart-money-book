# Backend and analytics validation — October 5, 2026

- Production build and TypeScript pass.
- Desktop/mobile browser suite: **22 passed, 4 skipped**. Covered auth-note removal, public routes, unauthorized access, rejected credentials/email, successful live visitor requests, repeat views with distinct event IDs, same-browser identity reuse, query-only navigation between blog posts, and tracking with blocked local storage.
- The skipped tests require optional owner credentials or a separate published discussion fixture. No password from screenshots was used to authenticate or stored in this repository.
- Ten observed browser event IDs were matched to persisted Supabase rows. The approved-admin aggregate RPC reported real totals from those events, including per-post counts and the seven-day visitor chart.
- `supabase/tests/analytics.sql` passes inside a rolled-back transaction: retry idempotency, repeat page views, distinct visitors, draft/admin/invalid-route exclusion, and dashboard aggregates. It uses the existing approved administrator for read authorization without changing the account.
- Original signup/RLS/CRUD and Storage transaction tests passed in the initial backend integration. The original signup tests are intended only for an unclaimed account slot; the real administrator is now registered and approved.
- All analytics-test posts and predeployment test events are removed after verification so production starts collecting real traffic.
- The dashboard polls metrics every 15 seconds while visible. Blog/tutorial/draft counts come from live content; total and individual post views come from private event aggregates.

Tracking begins with this release. Earlier visitors cannot be reconstructed because the previous client requests were not executed. Unique visitors identify browsers rather than people; local-storage blocking limits recognition across reloads. Events are recorded after JavaScript runs, so blocked JavaScript and bots that do not run it are excluded. No visitor IP addresses or personal identity are collected.

See `docs/admin-workspace.md` for the data flow and metric definitions.
