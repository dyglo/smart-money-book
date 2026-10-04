export type Section = {
  id: string;
  title: string;
  paragraphs: string[];
  points?: string[];
  chart?: "bullish" | "bearish";
};
export type Article = {
  slug: string;
  title: string;
  category: string;
  description: string;
  date: string;
  readTime: string;
  sections: Section[];
};
export const articles: Article[] = [
  {
    slug: "ict-reclaimed-order-block",
    title:
      "ICT Reclaimed Order Block — Theory, Bullish & Bearish Setups + Free PDF",
    category: "ICT Trading Tutorials",
    description:
      "Understand the curve, identify a reclaimed block, and build a structured bullish or bearish trade plan.",
    date: "October 4, 2026",
    readTime: "8 min read",
    sections: [
      {
        id: "what-is",
        title: "What is an ICT Reclaimed Order Block?",
        paragraphs: [
          "In ICT terminology, a reclaimed order block is a previously formed price zone that becomes relevant again when price returns during a later directional leg. The context of the Market Maker Buy or Sell Model helps explain why traders watch that zone.",
          "Think of price moving through two sides of a curve: a declining leg and an advancing leg. In a bullish model, the zone may form during the decline and be revisited as price advances. In a bearish model, the sequence is reversed.",
          "This guide uses simplified educational examples. A historical price pattern does not establish what institutions actually did or guarantee the next move.",
        ],
      },
      {
        id: "bullish",
        title: "Bullish Reclaimed Order Block",
        paragraphs: [
          "Start with a higher-timeframe bullish narrative. Mark a relevant discount area, observe a liquidity sweep, and wait for displacement that changes the short-term structure.",
          "The last down-close candle before the earlier minor displacement is a candidate zone. When price revisits it on the advancing leg, watch for lower-timeframe confirmation rather than entering automatically.",
        ],
        chart: "bullish",
      },
      {
        id: "bearish",
        title: "Bearish Reclaimed Order Block",
        paragraphs: [
          "For the bearish scenario, begin with a higher-timeframe resistance or premium area. Price may move up into liquidity before a decisive bearish displacement.",
          "Mark the earlier up-close candle and observe its later retest from below. A lower-timeframe structure shift can help define a potential entry, invalidation, and target.",
        ],
        chart: "bearish",
      },
      {
        id: "trade-flow",
        title: "Step-by-Step Reclaimed Order Block Trade Flow",
        paragraphs: [
          "Use the same sequence every time so that your journal records a repeatable process.",
        ],
        points: [
          "Identify your higher-timeframe bias and the next draw on liquidity.",
          "Mark the relevant higher-timeframe order block or fair value gap.",
          "Locate the earlier candle and minor displacement within the curve.",
          "Wait for a directional shift and a return to the marked zone.",
          "Look for lower-timeframe confirmation during your chosen session.",
          "Define invalidation beyond the zone before considering an entry.",
          "Size the position from a fixed risk budget, then journal the outcome.",
        ],
      },
      {
        id: "markets",
        title: "Best Markets for the Reclaimed Order Block",
        paragraphs: [
          "These concepts can be studied on liquid futures, major forex pairs, and gold. Session timing, spreads, contract specifications, and volatility vary by market.",
        ],
        points: [
          "NQ and ES: study the New York morning session and prior-session liquidity.",
          "EUR/USD and GBP/USD: compare London and New York session behavior.",
          "XAU/USD: account for wider price swings and scheduled economic releases.",
        ],
      },
      {
        id: "confirmation",
        title: "Does Every ICT Reclaimed Order Block Work?",
        paragraphs: [
          "No. A zone can fail, a retest may never happen, and an apparent structure shift can reverse. Selective entries and a defined invalidation level matter more than finding more patterns.",
          "Consider market structure, displacement, correlated-market context, and the timing of the setup together. Practice in replay or a demo environment before risking capital.",
        ],
      },
      {
        id: "mistakes",
        title: "Common Mistakes Trading the Reclaimed Order Block",
        paragraphs: [
          "A consistent checklist can help you avoid these common errors.",
        ],
        points: [
          "Labeling every old candle a reclaimed order block without curve context.",
          "Entering the first touch without a defined confirmation rule.",
          "Placing a stop based on desired position size rather than invalidation.",
          "Ignoring scheduled news, transaction costs, and session conditions.",
          "Increasing risk to recover a previous loss.",
        ],
      },
      {
        id: "pdf-download",
        title: "ICT Reclaimed Order Block PDF Download",
        paragraphs: [
          "Keep a copy of the lesson and its checklist in your study folder. The download below is a sample PDF for this preview; your own book and strategy files can replace it later.",
        ],
      },
      {
        id: "faqs",
        title: "FAQs about the ICT Reclaimed Order Block",
        paragraphs: [
          "Quick answers to the questions that come up when studying reclaimed blocks.",
        ],
      },
    ],
  },
  {
    slug: "fair-value-gap",
    title: "ICT Fair Value Gap — Identification, Entries & Risk",
    category: "Market Structure",
    description:
      "A practical introduction to three-candle imbalances and the context behind a potential retest.",
    date: "October 3, 2026",
    readTime: "5 min read",
    sections: [
      {
        id: "what-is",
        title: "What is a Fair Value Gap?",
        paragraphs: [
          "A fair value gap is a three-candle formation where the first and third candles leave an overlapping price interval untraded after a displacement candle. Traders study that interval as a possible retest area.",
          "A gap is an observation about price, not a promise of a reversal or continuation. First establish the higher-timeframe context.",
        ],
      },
      {
        id: "trade-flow",
        title: "A Simple Study Checklist",
        paragraphs: ["Record each example before looking at the outcome."],
        points: [
          "Identify a strong displacement candle.",
          "Mark the gap between the first and third candle wicks.",
          "Check whether the gap aligns with your directional narrative.",
          "Define a confirmation rule and an invalidation level.",
          "Review both successful and failed examples.",
        ],
      },
      {
        id: "pdf-download",
        title: "Fair Value Gap Study PDF",
        paragraphs: [
          "Download the sample study notes and add your own chart observations.",
        ],
      },
      {
        id: "faqs",
        title: "Frequently Asked Questions",
        paragraphs: [
          "Every formation should be evaluated in the broader market context.",
        ],
      },
    ],
  },
  {
    slug: "liquidity-sweep",
    title: "Liquidity Sweeps — Reading the Move Beyond a Swing",
    category: "ICT Trading Tutorials",
    description:
      "Learn how to distinguish a sweep from a breakout and wait for meaningful confirmation.",
    date: "October 2, 2026",
    readTime: "6 min read",
    sections: [
      {
        id: "what-is",
        title: "Understanding Liquidity Sweeps",
        paragraphs: [
          "A liquidity sweep describes price moving beyond a visible high or low and subsequently returning inside that level. Traders often watch prior-session extremes and equal highs or lows.",
          "A move beyond a level can also continue as a breakout. Avoid treating every wick as a reversal signal.",
        ],
      },
      {
        id: "trade-flow",
        title: "Building a Trade Plan",
        paragraphs: ["Write the plan before the level is reached."],
        points: [
          "Mark a clear prior high or low.",
          "Check the higher-timeframe direction and session.",
          "Wait for a return through the level and displacement.",
          "Define the entry condition, invalidation, and target.",
        ],
      },
      {
        id: "pdf-download",
        title: "Liquidity Sweep Checklist PDF",
        paragraphs: [
          "Use the sample PDF as a starting point for your own study notes.",
        ],
      },
      {
        id: "faqs",
        title: "Frequently Asked Questions",
        paragraphs: [
          "Study the reaction after a level is taken, not only the wick itself.",
        ],
      },
    ],
  },
];
export const resources = [
  {
    slug: "smart-money-playbook",
    title: "Smart Money Trading Playbook",
    category: "Books",
    description:
      "A structured companion for studying market structure, liquidity, and trade planning.",
    pages: 24,
  },
  {
    slug: "ict-glossary",
    title: "ICT Trading Glossary",
    category: "Reference",
    description:
      "Plain-language definitions of order blocks, displacement, liquidity, and fair value gaps.",
    pages: 8,
  },
  {
    slug: "trade-checklist",
    title: "Pre-Trade Checklist",
    category: "Worksheets",
    description:
      "A printable routine for bias, confirmation, risk, and post-trade review.",
    pages: 3,
  },
  {
    slug: "trading-journal",
    title: "Trading Journal Worksheet",
    category: "Worksheets",
    description:
      "Record the narrative, entry, invalidation, and lesson from each study example.",
    pages: 4,
  },
];
export const faqs = [
  [
    "How is a reclaimed block different from a regular order block?",
    "A reclaimed block is interpreted within a broader curve or Market Maker model, with the earlier zone revisited on a later leg.",
  ],
  [
    "Where should I look for an entry?",
    "Study the retest with a predefined lower-timeframe confirmation rule. The zone alone is not enough to establish a trade.",
  ],
  [
    "Does every setup work?",
    "No. All patterns can fail. Define risk, account for costs, and study failed examples as carefully as successful ones.",
  ],
];
