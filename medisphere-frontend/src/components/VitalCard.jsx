function VitalCard({ label, value, unit }) {
  return (
    <div className="vital-card">
      <span className="vital-label">{label}</span>
      <strong>{value ?? "—"}</strong>
      {unit && <span className="vital-unit">{unit}</span>}
    </div>
  );
}

export default VitalCard;
