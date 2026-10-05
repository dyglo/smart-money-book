# Smart Money Book brand system

The October 2026 home page redesign replaces the original ICT website theme with the user's supplied typography and palette reference.

## Typography

Urbanist variable font, weights 100–900, sourced from the Google Fonts repository and self-hosted through `next/font/local`. License: `app/fonts/OFL.txt`. Body text uses medium weight; primary headings use black weight, with semibold and bold supporting headings and controls. Responsive headline sizes range from 46px on phones to 64px on desktop. Long-form lessons retain comfortable reading line height.

## Palette

- Primary: `#FED415`
- Secondary accent: `#FDA014`
- Positive chart candles: `#5FC756`
- Negative chart candles: `#E14535`
- Charcoal: `#272831`
- Neutral: `#929397`
- Subtle: `#B8B9C1`
- Borders: `#EFEFF0`
- Canvas: `#F5F5F6`
- Surface: `#FFFFFF`

Yellow controls use charcoal text. Reading links use a darker yellow-derived color for legibility on white. Muted reading text uses a darker neutral than the source swatches.

## Home page

A chart-led introduction, topic shortcuts, a three-step learning path, latest strategy notes, downloadable study tools, and a closing link to the blog. All actions connect to live tutorial/library routes and published PDFs. Chart visuals are illustrative learning diagrams, not quotes, signals, or live trading data.

## Deployment

The existing Vercel project is connected to `dyglo/smart-money-book`; changes on `main` trigger production deployment. Keep completed work locally until the production build and browser checks pass, then publish the coherent update. No separate hosting provider is configured.
