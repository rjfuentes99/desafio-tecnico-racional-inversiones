import { useMemo, useState } from "react";
import { useInvestmentEvolution } from "../hooks/useInvestmentEvolution";
import { filterSeriesByRange } from "../utils/dateFilters";
import { formatCLP, formatPct } from "../utils/format";
import EvolutionChart from "./EvolutionChart";
import KPICard from "./KPICard";
import ConnectionStatus from "./ConnectionStatus";
import FilterBar from "./FilterBar";

export default function Dashboard() {
  const { series, raw, status, error, lastUpdate } = useInvestmentEvolution("user1");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filteredSeries = useMemo(
    () => filterSeriesByRange(series, activeFilter),
    [series, activeFilter]
  );

  const kpis = useMemo(() => {
    if (filteredSeries.length < 1) return null;
    const first = filteredSeries[0].value;
    const last = filteredSeries[filteredSeries.length - 1].value;
    const change = last - first;
    const changePct = first === 0 ? 0 : (change / first) * 100;
    const max = Math.max(...filteredSeries.map((p) => p.value));
    const min = Math.min(...filteredSeries.map((p) => p.value));
    return { first, last, change, changePct, max, min };
  }, [filteredSeries]);

  const tone =
    kpis && kpis.change > 0 ? "positive" : kpis && kpis.change < 0 ? "negative" : "neutral";

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <div className="brand">
            <span className="brand__mark">R</span>
            <span className="brand__name">Racional</span>
          </div>
          <h1>Mi Portafolio</h1>
          <p className="subtitle">
            Evolución en tiempo real · <code>investmentEvolutions/user1</code>
          </p>
        </div>
        <ConnectionStatus status={status} lastUpdate={lastUpdate} />
      </header>

      {status === "error" && (
        <div className="error-banner">
          <strong>Error de conexión.</strong> {error}
        </div>
      )}

      {kpis ? (
        <div className="kpi-grid">
          <KPICard label="Valor actual" value={formatCLP(kpis.last)} accent />
          <KPICard
            label="Variación del período"
            value={formatCLP(kpis.change)}
            delta={formatPct(kpis.changePct)}
            tone={tone}
          />
          <KPICard label="Máximo del período" value={formatCLP(kpis.max)} />
          <KPICard label="Mínimo del período" value={formatCLP(kpis.min)} />
        </div>
      ) : status === "live" ? (
        <div className="empty-banner">
          El documento existe pero no contiene una serie reconocible. Revisa el inspector abajo.
        </div>
      ) : null}

      <div className="card">
        <div className="card__header">
          <h2>Evolución del portafolio</h2>
          <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>
        <EvolutionChart
          data={filteredSeries}
          firstValue={filteredSeries[0]?.value}
          loading={status === "connecting"}
        />
      </div>

      {raw && (
        <details className="inspector">
          <summary>Inspeccionar payload de Firestore</summary>
          <pre>{JSON.stringify(raw, null, 2)}</pre>
        </details>
      )}

      <footer className="footer">
        Construido para el Desafío Racional · React · Firebase · Chart.js
      </footer>
    </div>
  );
}
