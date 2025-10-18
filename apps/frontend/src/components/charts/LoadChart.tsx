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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Load vs Renewables</h2>
        {loading ? (
          <span className="text-xs font-medium uppercase tracking-wide text-teal-600">
            Updating…
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Visualize the baseline load alongside renewable availability and the
        optimized profile produced by the heuristic.
      </p>
      <div className="mt-6 h-80 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataset} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
              <XAxis dataKey="time" tickFormatter={formatHourLabel} stroke="#64748b" />
              <YAxis tickFormatter={formatPower} stroke="#64748b" width={70} />
              <Tooltip
                formatter={(value: number) => formatPower(value)}
                labelFormatter={(label: string) => formatHourLabel(label)}
              />
              <Legend />
              <Line type="monotone" dataKey="base" stroke="#94a3b8" strokeWidth={2} dot={false} name="Baseline" />
              <Line type="monotone" dataKey="optimized" stroke="#38bdf8" strokeWidth={2} dot={false} name="Optimized" />
              <Line type="monotone" dataKey="renewable" stroke="#34d399" strokeWidth={2} dot={false} name="Renewable" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">
              Click <strong>Start Forecast</strong> to load the latest dataset.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
