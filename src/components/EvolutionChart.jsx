import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { formatCLP, formatCompact, formatPct } from "../utils/format";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function EvolutionChart({ data, firstValue, loading }) {
  if (!data.length) {
    return (
      <div className="chart-empty">
        {loading ? "Cargando datos..." : "Sin datos para este período"}
      </div>
    );
  }

  const isPositive = data[data.length - 1].value >= data[0].value;
  const lineColor = isPositive ? "#10b981" : "#ef4444";
  const gradientBase = isPositive ? "rgba(16,185,129," : "rgba(239,68,68,";
  const refValue = data[0].value;

  const values = data.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const pad = (maxVal - minVal) * 0.05 || maxVal * 0.01;

  // Plugins are inline so they capture closure vars without global registration issues
  const gradientPlugin = {
    id: "gradientFill-evolution",
    beforeDraw(chart) {
      const { ctx, chartArea, data: cd } = chart;
      if (!chartArea || !cd.datasets[0]) return;
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0, `${gradientBase}0.4)`);
      g.addColorStop(1, `${gradientBase}0)`);
      cd.datasets[0].backgroundColor = g;
    },
  };

  const referenceLinePlugin = {
    id: "referenceLine-evolution",
    afterDraw(chart) {
      const { ctx, scales, data: cd } = chart;
      if (!cd.datasets[0]?.data?.length) return;
      const yPos = scales.y.getPixelForValue(refValue);
      const { left, right } = scales.x;
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1;
      ctx.moveTo(left, yPos);
      ctx.lineTo(right, yPos);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.fillStyle = "#64748b";
      ctx.font = "11px -apple-system, system-ui, sans-serif";
      ctx.fillText("Inicio", left + 6, yPos - 5);
      ctx.restore();
    },
  };

  const chartData = {
    labels: data.map((p) => p.label),
    datasets: [
      {
        data: values,
        borderColor: lineColor,
        borderWidth: 2.5,
        backgroundColor: "transparent",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: "#0b1220",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        borderColor: "#1f2937",
        borderWidth: 1,
        titleColor: "#94a3b8",
        bodyColor: "#f1f5f9",
        footerColor: lineColor,
        padding: 12,
        cornerRadius: 8,
        boxPadding: 4,
        callbacks: {
          title(items) {
            const p = data[items[0].dataIndex];
            return `${p.label}${p.time ? " · " + p.time : ""}`;
          },
          label(item) {
            return ` ${formatCLP(item.raw)}`;
          },
          footer(items) {
            if (firstValue == null || !Number.isFinite(firstValue)) return "";
            const delta = items[0].raw - firstValue;
            const pct = (delta / firstValue) * 100;
            return `${delta >= 0 ? "▲" : "▼"} ${formatCLP(Math.abs(delta))}  ${formatPct(pct)} vs inicio`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#6b7280",
          font: { size: 12 },
          maxTicksLimit: 6,
          maxRotation: 0,
        },
      },
      y: {
        grid: { color: "#1f2937", drawTicks: false },
        border: { display: false, dash: [3, 3] },
        min: minVal - pad,
        max: maxVal + pad,
        ticks: {
          color: "#6b7280",
          font: { size: 12 },
          padding: 8,
          callback: formatCompact,
        },
      },
    },
  };

  return (
    <div style={{ position: "relative", height: "380px" }}>
      <Line
        data={chartData}
        options={options}
        plugins={[gradientPlugin, referenceLinePlugin]}
      />
    </div>
  );
}
