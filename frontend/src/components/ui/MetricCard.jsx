export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'gold',
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-icon-${tone}`}>
        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="metric-copy">
        <span className="metric-label">{label}</span>
        <strong className="metric-value">{value}</strong>
        <span className="metric-detail">{detail}</span>
      </div>
    </article>
  )
}
