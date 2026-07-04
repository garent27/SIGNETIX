/**
 * Circular accuracy ring for practice mode. The stroke runs the brand gradient
 * while signing and snaps to mint (#3DF5A4) once the gloss passes the threshold.
 */
export default function CircularProgress({
  value, // 0..1
  size = 184,
  stroke = 14,
  passed = false,
  threshold = 0.8,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  passed?: boolean;
  threshold?: number;
  label?: string;
}) {
  const v = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v);
  const pct = Math.round(v * 100);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringgrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3D8BFF" />
            <stop offset="55%" stopColor="#E5408D" />
            <stop offset="100%" stopColor="#FF7B3C" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1c2742" strokeWidth={stroke} fill="none" />
        {/* threshold tick */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#33415f"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`2 ${c}`}
          strokeDashoffset={-(c * threshold) + 1}
          strokeLinecap="round"
          opacity={0.9}
        />
        {/* progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={passed ? "#3DF5A4" : "url(#ringgrad)"}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.35s ease, stroke 0.3s ease",
            filter: passed
              ? "drop-shadow(0 0 10px rgba(61,245,164,0.65))"
              : "drop-shadow(0 0 7px rgba(229,64,141,0.4))",
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div
            className={`font-display text-4xl font-extrabold tabular-nums ${
              passed ? "text-mint" : "text-ink"
            }`}
          >
            {pct}
            <span className="text-xl align-top">%</span>
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            {label ?? "accuracy"}
          </div>
        </div>
      </div>
    </div>
  );
}
