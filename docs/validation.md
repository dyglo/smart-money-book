# Validation

Validated in the cloud workspace on October 4, 2026.

- Next.js 16.3.8 production build: passed; all application routes generated successfully.
- TypeScript check: passed.
- Playwright production-browser suite: 6 passed, using Chromium with 1440 × 1050 desktop and 390 × 844 phone viewports.
- Browser checks: article rendering, contents anchors, expandable FAQs, preview comments and refresh behavior, resource search, category filtering, empty state/reset, downloaded PDF filename, all seven PDF responses, all navigation routes, header search, phone menu, unknown tutorial 404, and horizontal overflow.
- Desktop and phone article screenshots inspected alongside the reference screenshots.

## Intentional boundaries

The reference's layout, colors, spacing, typography hierarchy, and content presentation are adapted to Smart Money Book. Branding, example writing, diagrams, and resource cards are original mock material. The reference's third-party advertisements, trackers, author identities, and book assets are not included. System fonts are used; no licensed Proxima Nova font file was supplied.

PDFs are one-page mock study resources. Comment previews exist only in component state. There is no backend, admin management, authentication, or persistent content submission. The project has been saved to GitHub; a public website deployment has not been configured.
