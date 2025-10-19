"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatHourLabel, formatPower } from "@/lib/formatting";

interface LoadChartProps {
  base: number[];
  optimized: number[];
  renewable: number[];
  timestamps: string[];
  loading?: boolean;
}

export function LoadChart({
  base,
  optimized,
  renewable,
  timestamps,
  loading = false,
}: LoadChartProps) {
  const hasData = base.length > 0 && timestamps.length === base.length;

  const dataset = hasData
    ? timestamps.map((time, idx) => ({
        time,
        base: base[idx] ?? 0,
        optimized: optimized[idx] ?? base[idx] ?? 0,
        renewable: renewable[idx] ?? 0,
      }))
    : [];

  return (
    <section className="card-fade-in card-float overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-teal-900/40 backdrop-blur-xl transition-transform duration-500">
      <div className="flex items-center justify-between text-white">
        <h2 className="text-lg font-semibold">Load vs Renewables</h2>
        {loading ? (
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-teal-300">
            Updating…
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/70">
        Visualize the baseline load alongside renewable availability and the
        optimized profile produced by the heuristic.
      </p>
      <div className="mt-6 h-80 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataset} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="time"
                tickFormatter={formatHourLabel}
                stroke="#cbd5f5"
                tick={{ fill: "#cbd5f5", fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatPower}
                stroke="#cbd5f5"
                tick={{ fill: "#cbd5f5", fontSize: 12 }}
                width={70}
              />
              <Tooltip
                formatter={(value: number) => formatPower(value)}
                labelFormatter={(label: string) => formatHourLabel(label)}
              />
              <Legend wrapperStyle={{ color: "#e2e8f0" }} />
              <Line type="monotone" dataKey="base" stroke="#94a3b8" strokeWidth={2} dot={false} name="Baseline" />
              <Line type="monotone" dataKey="optimized" stroke="#38bdf8" strokeWidth={2} dot={false} name="Optimized" />
              <Line type="monotone" dataKey="renewable" stroke="#34d399" strokeWidth={2} dot={false} name="Renewable" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5">
            <p className="text-sm text-white/70">
              Click <strong>Start Forecast</strong> to load the latest dataset.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
