import { TIME_FILTERS } from "../constants/filters";

export function filterSeriesByRange(series, filterValue) {
  if (!series.length || filterValue === "ALL") return series;

  const filter = TIME_FILTERS.find((f) => f.value === filterValue);
  if (!filter || filter.months == null) return series;

  const lastDate = series[series.length - 1].date;
  const cutoff = new Date(lastDate);
  cutoff.setMonth(cutoff.getMonth() - filter.months);

  return series.filter((p) => p.date >= cutoff);
}
