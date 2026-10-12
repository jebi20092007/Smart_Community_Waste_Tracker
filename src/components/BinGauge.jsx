const TOP = 60;
const BOTTOM = 332;
const HEIGHT = BOTTOM - TOP;
const BODY = "M30 60 L50 320 Q52 332 64 332 L196 332 Q208 332 210 320 L230 60 Z";

export default function BinGauge({ fill, tone, blocked, dim }) {
  const pct = Math.max(0, Math.min(100, fill ?? 0));
  const offset = HEIGHT - (HEIGHT * pct) / 100;
  const y50 = BOTTOM - HEIGHT * 0.5;
  const y80 = BOTTOM - HEIGHT * 0.8;

  return (
    <svg
      className={`bin bin--${tone} ${dim ? "bin--dim" : ""}`}
      viewBox="0 0 280 350"
      role="img"
      aria-label={dim ? "Bin fill level unknown" : `Bin is ${Math.round(pct)} percent full`}
    >
      <defs>
        <clipPath id="bin-clip">
          <path d={BODY} />
        </clipPath>
        <pattern id="hazard" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill="#f4f1ea" />
          <rect width="7" height="14" fill="var(--red)" />
        </pattern>
      </defs>

      <path d={BODY} className="bin__shell" />
      <g clipPath="url(#bin-clip)">
        <rect x="0" y={TOP} width="280" height={HEIGHT} className="bin__fill" style={{ transform: `translateY(${offset}px)` }} />
        <rect x="0" y={TOP} width="280" height={HEIGHT} className="bin__sheen" style={{ transform: `translateY(${offset}px)` }} />
      </g>
      <path d={BODY} className="bin__outline" />

      <g className="bin__marks">
        <line x1="22" x2="238" y1={y50} y2={y50} />
        <line x1="22" x2="238" y1={y80} y2={y80} />
        <text x="246" y={y50 + 4}>50%</text>
        <text x="246" y={y80 + 4}>80%</text>
      </g>

      <g className="bin__lid">
        <rect x="20" y="40" width="200" height="20" rx="6" className="bin__lid-body" />
        {blocked && <rect x="20" y="40" width="200" height="20" rx="6" fill="url(#hazard)" className="bin__hazard" />}
        <rect x="100" y="30" width="40" height="12" rx="5" className="bin__lid-body" />
      </g>
    </svg>
  );
}
