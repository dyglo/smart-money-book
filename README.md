# Smart Money Book

A Next.js web app for sharing ICT trading strategies, PDF books, tutorials, and educational resources. The first version uses mock content only.

## Run on your PC or in the cloud

Requires Node.js 20.9 or later.

```bash
git clone https://github.com/dyglo/smart-money-book.git
cd smart-money-book
npm ci
npm run dev
```

Open http://localhost:3000. For a production version, run `npm run build` followed by `npm run start`.

## Included

- A trading study home page with an annotated setup chart, learning path, tutorial cards, and PDF toolkit.
- Urbanist typography and a yellow/charcoal design system applied throughout the site.
- Article pages with a contents list, chart diagrams, FAQs, related lessons, and a resource sidebar.
- Tutorial, blog, market structure, PDF book, and resource pages.
- Resource search and category filtering, downloadable sample PDFs, and mobile navigation.
- Browser-only preview comments. They disappear on refresh; no backend, accounts, or persistent submissions are configured.

Mock records are in `lib/content.ts`. Replace PDFs in `public/pdfs/` with your own files. Sample PDFs contain one page of preview material; they are not finished books. `scripts/generate-sample-pdfs.mjs` regenerates the samples.

The current design system is documented in `docs/brand-system.md`. The original inspected reference and design measurements are documented in `docs/design-reference.md`. Smart Money Book uses its own branding, mock copy, and illustrative charts.

## Checks

```bash
npm run build
npm run typecheck
npm test
```

Browser tests cover desktop and phone layouts, navigation, resource searches, PDF downloads, and preview discussions. In this cloud environment they use `/usr/bin/chromium`. On another machine, update `playwright.config.ts` to remove `executablePath`, then run `npx playwright install chromium`.

## Project stages

Each completed stage is validated and saved to GitHub separately: Next.js foundation, article experience, resource library, and browser verification/documentation.

## Disclaimer

Educational content only. Trading involves risk and these resources are not financial advice. Smart Money Book is an independent project, not affiliated with ICT or the reference website.

## Live site

https://smart-money-book.vercel.app

Vercel deploys automatically when the connected repository changes on `main`. Build and run browser checks before publishing changes.
