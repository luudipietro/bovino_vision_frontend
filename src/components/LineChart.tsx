import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";

export type SeriesTone = "brand" | "earth";

export interface ChartSeries {
  name: string;
  tone?: SeriesTone;
  /** One value per label; null leaves a gap. */
  values: (number | null)[];
}

interface LineChartProps {
  labels: string[];
  series: ChartSeries[];
  formatValue: (value: number) => string;
  formatAxis?: (value: number) => string;
  ariaLabel: string;
  height?: number;
  emptyMessage?: string;
}

const STROKE: Record<SeriesTone, string> = { brand: "#2f8a52", earth: "#a87c57" };
const SWATCH: Record<SeriesTone, string> = { brand: "bg-green-500", earth: "bg-brown-400" };
const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
const SMOOTHING = 0.18;

interface Point {
  x: number;
  y: number;
}

function niceStep(raw: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / magnitude;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * magnitude;
}

function axisTicks(min: number, max: number): number[] {
  const span = max - min || Math.abs(max) || 1;
  const step = niceStep(span / 3);
  const low = Math.floor(min / step) * step;
  const high = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let tick = low; tick <= high + step / 2; tick += step) ticks.push(Number(tick.toFixed(6)));
  return ticks.length > 1 ? ticks : [low, low + step];
}

/** Smooth cubic path through the points, using neighbor slopes as control handles. */
function smoothPath(points: Point[]): string {
  const [first] = points;
  if (!first) return "";
  let path = `M${first.x},${first.y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 2] ?? points[i - 1]!;
    const p1 = points[i - 1]!;
    const p2 = points[i]!;
    const p3 = points[i + 1] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) * SMOOTHING, y: p1.y + (p2.y - p0.y) * SMOOTHING };
    const c2 = { x: p2.x - (p3.x - p1.x) * SMOOTHING, y: p2.y - (p3.y - p1.y) * SMOOTHING };
    path += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
  }
  return path;
}

/** Splits a series into runs of consecutive non-null values. */
function segments(values: (number | null)[], toPoint: (index: number, value: number) => Point): Point[][] {
  const runs: Point[][] = [];
  let current: Point[] = [];
  values.forEach((value, index) => {
    if (value == null) {
      if (current.length) runs.push(current);
      current = [];
      return;
    }
    current.push(toPoint(index, value));
  });
  if (current.length) runs.push(current);
  return runs;
}

function visibleLabelIndexes(count: number): Set<number> {
  if (count <= 6) return new Set(Array.from({ length: count }, (_, index) => index));
  return new Set([0, 1, 2, 3, 4].map((k) => Math.round((k * (count - 1)) / 4)));
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(entry.contentRect.width, 240));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Smoothed line chart with horizontal grid, dashed hover cursor and a dark tooltip. */
export default function LineChart({
  labels,
  series,
  formatValue,
  formatAxis = formatValue,
  ariaLabel,
  height = 220,
  emptyMessage = "Todavía no hay suficientes datos para graficar.",
}: LineChartProps) {
  const [containerRef, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const present = series.flatMap((s) => s.values.filter((v): v is number => v != null));
  if (labels.length < 2 || present.length < 2) {
    return <p className="py-8 text-sm text-neutral-500">{emptyMessage}</p>;
  }

  const ticks = axisTicks(Math.min(...present), Math.max(...present));
  const low = ticks[0]!;
  const high = ticks[ticks.length - 1]!;
  const plotWidth = width - PAD.left - PAD.right;
  const plotHeight = height - PAD.top - PAD.bottom;
  const stepX = plotWidth / (labels.length - 1);
  const xAt = (index: number) => PAD.left + index * stepX;
  const yAt = (value: number) => PAD.top + plotHeight - ((value - low) / (high - low)) * plotHeight;
  const showDots = labels.length <= 16;
  const labelIndexes = visibleLabelIndexes(labels.length);

  function indexFromPointer(event: PointerEvent<SVGSVGElement>) {
    const left = event.currentTarget.getBoundingClientRect().left;
    const index = Math.round((event.clientX - left - PAD.left) / stepX);
    setActive(Math.min(Math.max(index, 0), labels.length - 1));
  }

  function moveWithKeyboard(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowLeft" ? -1 : 1;
    setActive((current) => Math.min(Math.max((current ?? (delta > 0 ? -1 : labels.length)) + delta, 0), labels.length - 1));
  }

  const activeX = active != null ? xAt(active) : 0;
  const tooltipOnLeft = activeX > width / 2;

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        tabIndex={0}
        className="block touch-pan-y outline-none"
        onPointerMove={indexFromPointer}
        onPointerDown={indexFromPointer}
        onPointerLeave={() => setActive(null)}
        onKeyDown={moveWithKeyboard}
        onBlur={() => setActive(null)}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={width - PAD.right} y1={yAt(tick)} y2={yAt(tick)} stroke="#e2e2db" />
            <text x={PAD.left - 10} y={yAt(tick)} dy="0.35em" textAnchor="end" className="fill-neutral-400 text-[11px]">
              {formatAxis(tick)}
            </text>
          </g>
        ))}

        {labels.map((label, index) =>
          labelIndexes.has(index) ? (
            <text
              key={`${label}-${index}`}
              x={xAt(index)}
              y={height - 8}
              textAnchor={index === 0 ? "start" : index === labels.length - 1 ? "end" : "middle"}
              className={`text-[11px] ${index === active ? "fill-neutral-800 font-semibold" : "fill-neutral-400"}`}
            >
              {label}
            </text>
          ) : null,
        )}

        {active != null && (
          <line
            x1={activeX}
            x2={activeX}
            y1={PAD.top}
            y2={PAD.top + plotHeight}
            stroke="#7c7c73"
            strokeDasharray="3 4"
          />
        )}

        {series.map((serie) => {
          const color = STROKE[serie.tone ?? "brand"];
          const runs = segments(serie.values, (index, value) => ({ x: xAt(index), y: yAt(value) }));
          return (
            <g key={serie.name}>
              {runs.map((run) => (
                <path
                  key={`${run[0]!.x}`}
                  d={smoothPath(run)}
                  fill="none"
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {runs.flat().map((point, index) =>
                showDots || index === 0 || index === runs.flat().length - 1 ? (
                  <circle key={point.x} cx={point.x} cy={point.y} r={4.5} fill={color} />
                ) : null,
              )}
              {active != null && serie.values[active] != null && (
                <g>
                  <circle cx={activeX} cy={yAt(serie.values[active]!)} r={8} fill="white" stroke={color} strokeWidth={2} />
                  <circle cx={activeX} cy={yAt(serie.values[active]!)} r={4} fill={color} />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {active != null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-[10px] bg-green-900 px-3 py-2.5 text-white shadow-lg"
          style={tooltipOnLeft ? { right: width - activeX + 14 } : { left: activeX + 14 }}
        >
          <p className="text-[10px] font-medium text-white/70">{labels[active]}</p>
          {series.map((serie) => {
            const value = serie.values[active];
            return (
              <p key={serie.name} className="mt-1 flex items-center gap-2 text-[11px]">
                <span className={`h-1 w-[7px] rounded-full ${SWATCH[serie.tone ?? "brand"]}`} />
                <span className="flex-1">{serie.name}</span>
                <span className="font-bold tabular-nums">{value != null ? formatValue(value) : "—"}</span>
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Legend with short line segments, placed in the card header. */
export function ChartLegend({ items }: { items: { name: string; tone?: SeriesTone }[] }) {
  return (
    <div className="flex flex-wrap gap-4 text-[11px] text-neutral-400">
      {items.map((item) => (
        <span key={item.name} className="flex items-center gap-1.5">
          <span className={`h-1 w-4 rounded-full ${SWATCH[item.tone ?? "brand"]}`} />
          {item.name}
        </span>
      ))}
    </div>
  );
}
