import { TIME_FILTERS } from "../constants/filters";

export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="filter-bar">
      {TIME_FILTERS.map((f) => (
        <button
          key={f.value}
          className={`filter-bar__btn${activeFilter === f.value ? " filter-bar__btn--active" : ""}`}
          onClick={() => onFilterChange(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
