const W = 640;
const H = 180;
const PAD = { top: 10, right: 40, bottom: 22, left: 8 };

function fmtTime(t) {
  return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function HistoryChart({ points }) {
  if (points.length < 2) {
    return (
      <div className="chart chart--empty">
        <p>The fill history appears here once two readings have arrived.</p>
      </div>
    );
  }

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const t0 = points[0].t;
  const t1 = points[points.length - 1].t;
  const span = Math.max(1, t1 - t0);
  const x = (t) => PAD.left + ((t - t0) / span) * innerW;
  const y = (v) => PAD.top + innerH - (v / 100) * innerH;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.fill).toFixed(1)}`).join(" ");
  const area = `${line} L${x(t1).toFixed(1)} ${y(0)} L${x(t0).toFixed(1)} ${y(0)} Z`;
  const blocked = points.filter((p) => p.blockage);

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Fill level over time">
        <rect x={PAD.left} y={y(100)} width={innerW} height={y(80) - y(100)} className="chart__zone chart__zone--full" />
        <rect x={PAD.left} y={y(80)} width={innerW} height={y(50) - y(80)} className="chart__zone chart__zone--filling" />
        {[0, 50, 80, 100].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={PAD.left + innerW} y1={y(v)} y2={y(v)} className="chart__grid" />
            <text x={W - PAD.right + 8} y={y(v) + 4} className="chart__tick">{v}%</text>
          </g>
        ))}
        <path d={area} className="chart__area" />
        <path d={line} className="chart__line" />
        {blocked.map((p) => (
          <circle key={p.t} cx={x(p.t)} cy={y(p.fill)} r="4.5" className="chart__block" />
        ))}
        <text x={PAD.left} y={H - 4} className="chart__tick">{fmtTime(t0)}</text>
        <text x={PAD.left + innerW} y={H - 4} textAnchor="end" className="chart__tick">{fmtTime(t1)}</text>
      </svg>
      {blocked.length > 0 && (
        <figcaption>
          <span className="chart__legend-dot" aria-hidden="true" /> Red dots mark readings where the opening was blocked.
        </figcaption>
      )}
    </figure>
  );
}
