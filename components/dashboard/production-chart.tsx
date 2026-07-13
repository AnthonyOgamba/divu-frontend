import type { TrendPoint } from "./dashboard-data";

const width = 760;
const height = 230;
const padding = { top: 20, right: 20, bottom: 38, left: 52 };

function chartCoordinates(data: TrendPoint[]) {
  const values = data.map((point) => point.value);
  const min = Math.floor((Math.min(...values) - 40) / 100) * 100;
  const max = Math.ceil((Math.max(...values) + 40) / 100) * 100;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  return {
    min,
    max,
    points: data.map((point, index) => ({
      ...point,
      x: padding.left + (index / (data.length - 1)) * plotWidth,
      y: padding.top + ((max - point.value) / (max - min)) * plotHeight,
    })),
  };
}

export function ProductionChart({ data }: { data: TrendPoint[] }) {
  const { min, max, points } = chartCoordinates(data);
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points.at(-1)?.x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
  const guides = [max, Math.round((max + min) / 2), min];

  return (
    <div className="p-3 sm:p-5">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto min-h-52 w-full"
        role="img"
        aria-labelledby="production-chart-title production-chart-description"
      >
        <title id="production-chart-title">Production output trend</title>
        <desc id="production-chart-description">
          Production output rises from 1,180 units per hour at 06:00 to 1,410 units per hour at 18:00.
        </desc>
        <defs>
          <linearGradient id="dashboard-production-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--dv-accent)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--dv-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {guides.map((guide, index) => {
          const y = padding.top + (index / (guides.length - 1)) * (height - padding.top - padding.bottom);
          return (
            <g key={guide}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="var(--dv-border)"
                strokeDasharray="4 5"
              />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-[var(--dv-muted)] font-mono text-[10px]">
                {guide.toLocaleString()}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#dashboard-production-fill)" />
        <path d={linePath} fill="none" stroke="var(--dv-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4" fill="var(--dv-card)" stroke="var(--dv-accent)" strokeWidth="2.5" />
            <text
              x={point.x}
              y={height - 13}
              textAnchor="middle"
              className="fill-[var(--dv-muted)] font-mono text-[10px]"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
