interface Props {
  value: number;
  max: number;
  onChange: (v: number) => void;
}

export default function SeatCounter({ value, max, onChange }: Props) {
  return (
    <div className="phato-seat-counter">
      <button
        className="phato-seat-btn"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        aria-label="Decrease seats"
      >
        −
      </button>
      <div className="phato-seat-display">
        <span className="phato-seat-value">{value}</span>
        <span className="phato-seat-max">/{max}</span>
      </div>
      <button
        className="phato-seat-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase seats"
      >
        +
      </button>
    </div>
  );
}
