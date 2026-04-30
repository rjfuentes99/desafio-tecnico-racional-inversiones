export function normalize(data) {
  const arr =
    data.evolution ||
    data.points ||
    data.history ||
    data.data ||
    data.series ||
    data.array;

  if (Array.isArray(arr)) {
    return arr
      .map((p) => ({
        date: toDate(p.date ?? p.timestamp ?? p.t ?? p.time),
        value: Number(
          p.value ?? p.amount ?? p.v ?? p.total ?? p.portfolioValue ?? p.portfolioIndex
        ),
      }))
      .filter((p) => p.date && Number.isFinite(p.value))
      .sort((a, b) => a.date - b.date)
      .map(decorate);
  }

  if (data.values && typeof data.values === "object") {
    return Object.entries(data.values)
      .map(([k, v]) => ({ date: toDate(k), value: Number(v) }))
      .filter((p) => p.date && Number.isFinite(p.value))
      .sort((a, b) => a.date - b.date)
      .map(decorate);
  }

  return [];
}

function decorate(p) {
  return {
    ...p,
    label: p.date.toLocaleDateString("es-CL", { day: "2-digit", month: "short" }),
    time: p.date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
    iso: p.date.toISOString(),
  };
}

function toDate(val) {
  if (!val) return null;
  if (typeof val === "object" && typeof val.toDate === "function") return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val === "number") return new Date(val < 1e12 ? val * 1000 : val);
  const d = new Date(val);
  return isNaN(d) ? null : d;
}
