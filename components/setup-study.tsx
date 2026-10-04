import Link from "next/link";
const candles = [
  { o: 160, c: 144 },
  { o: 144, c: 173 },
  { o: 173, c: 158 },
  { o: 158, c: 193 },
  { o: 193, c: 207 },
  { o: 207, c: 190 },
  { o: 190, c: 222 },
  { o: 222, c: 196 },
  { o: 196, c: 151 },
  { o: 151, c: 119 },
  { o: 119, c: 133 },
  { o: 133, c: 110 },
  { o: 110, c: 155 },
  { o: 155, c: 143 },
  { o: 143, c: 164 },
  { o: 164, c: 132 },
  { o: 132, c: 95 },
  { o: 95, c: 70 },
  { o: 70, c: 83 },
  { o: 83, c: 48 },
  { o: 48, c: 62 },
  { o: 62, c: 34 },
];
export function SetupStudy() {
  return (
    <div className="setup-study">
      <div className="setup-top">
        <div>
          <span className="setup-label">INSIDE THE NOTEBOOK</span>
          <h2>The anatomy of a setup.</h2>
        </div>
        <span className="study-badge">CHART STUDY</span>
      </div>
      <div className="setup-chart">
        <div className="chart-topline">
          <span>Reclaimed order block</span>
          <span>Illustrative example</span>
        </div>
        <svg
          viewBox="0 0 580 285"
          role="img"
          aria-label="Illustrative bullish setup: liquidity sweep, displacement, and retest of an order block"
        >
          <defs>
            <pattern
              id="study-grid"
              width="44"
              height="45"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M44 0H0V45"
                fill="none"
                stroke="#ffffff"
                strokeOpacity=".06"
              />
            </pattern>
          </defs>
          <rect width="580" height="285" fill="url(#study-grid)" />
          <rect
            x="110"
            y="145"
            width="423"
            height="32"
            rx="2"
            fill="#fed415"
            opacity=".12"
          />
          <path
            d="M110 145H545"
            stroke="#fed415"
            strokeDasharray="5 5"
            opacity=".6"
          />
          {candles.map((c, i) => (
            <g key={i}>
              <path
                d={`M${25 + i * 24} ${Math.min(c.o, c.c) - 10}V${Math.max(c.o, c.c) + 13}`}
                stroke={c.c < c.o ? "#5fc756" : "#e14535"}
                strokeWidth="1.6"
              />
              <rect
                x={20 + i * 24}
                y={Math.min(c.o, c.c)}
                width="10"
                height={Math.abs(c.o - c.c)}
                rx="1"
                fill={c.c < c.o ? "#5fc756" : "#e14535"}
              />
            </g>
          ))}
          <path
            d="M169 245v-13M252 92l-17 30M367 195l-6-19"
            stroke="#b8b9c1"
            strokeWidth="1"
          />
          <text x="120" y="267" fill="#b8b9c1" fontSize="12">
            01 / Liquidity sweep
          </text>
          <text x="226" y="84" fill="#b8b9c1" fontSize="12">
            02 / Displacement
          </text>
          <text x="365" y="209" fill="#fed415" fontSize="12">
            03 / Retest
          </text>
        </svg>
      </div>
      <div className="setup-bottom">
        <span>
          <span className="setup-number">01</span> Context before confirmation.
        </span>
        <Link
          href="/tutorials/ict-reclaimed-order-block"
          aria-label="Open reclaimed order block study"
        >
          Open study <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}
