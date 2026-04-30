export default function KPICard({ label, value, delta, tone = "neutral", accent = false }) {
  return (
    <div className={`kpi ${accent ? "kpi--accent" : ""}`}>
      <span className="kpi__label">{label}</span>
      <span className="kpi__value">{value}</span>
      {delta !== undefined && delta !== null && (
        <span className={`kpi__delta kpi__delta--${tone}`}>
          {tone === "positive" && "▲ "}
          {tone === "negative" && "▼ "}
          {delta}
        </span>
      )}
    </div>
  );
}
