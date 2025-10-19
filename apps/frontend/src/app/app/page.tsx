"use client";

import { useMemo } from "react";
import { Header } from "@/components/common/Header";
import { ImpactCard } from "@/components/cards/ImpactCard";
import { LoadChart } from "@/components/charts/LoadChart";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { useAuraApi } from "@/hooks/useAuraApi";
import { formatCo2, formatPercent, formatPower } from "@/lib/formatting";

export default function DashboardPage() {
  const {
    state,
    loadForecast,
    optimizeLoad,
    fetchInsight,
    reset,
  } = useAuraApi();

  const metrics = useMemo(() => state.metrics ?? null, [state.metrics]);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-12">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-xl space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-600">
                Dashboard
              </p>
              <h1 className="text-3xl font-semibold">AuraGrid Forecast Console</h1>
              <p className="text-sm text-slate-600">
                Trigger the latest KV snapshot, run the optimization heuristic, and
                pull an AI summary to brief your ops team.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={loadForecast} loading={state.loading === "forecast"}>
                Start Forecast
              </Button>
              <Button
                onClick={optimizeLoad}
                disabled={!state.series.base.length}
                loading={state.loading === "optimize"}
                variant="secondary"
              >
                Optimize
              </Button>
              <Button
                onClick={fetchInsight}
                disabled={!metrics}
                loading={state.loading === "insight"}
                variant="ghost"
              >
                Generate Insight
              </Button>
              <Button onClick={reset} variant="plain">
                Reset
              </Button>
            </div>
          </div>

          <LoadChart
            base={state.series.base}
            optimized={state.series.optimized}
            renewable={state.series.renewable}
            timestamps={state.series.timestamps}
            loading={state.loading === "forecast" || state.loading === "optimize"}
          />

          <section className="grid gap-4 sm:grid-cols-3">
            <ImpactCard
              title="Peak Reduction"
              description="Decline in megawatts operating above the 90% threshold."
              value={metrics ? formatPercent(metrics.peak_reduction_pct) : "—"}
            />
            <ImpactCard
              title="Renewable Share"
              description="Increase in overlap between compute load and renewable supply."
              value={metrics ? formatPercent(metrics.renewable_gain_pct) : "—"}
            />
            <ImpactCard
              title="CO₂ Avoided"
              description="Daily savings versus the unshifted baseline."
              value={metrics ? formatCo2(metrics.co2_avoided_kg) : "—"}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">AI Insight</h2>
            <p className="mt-2 text-sm text-slate-500">
              Workers AI summarizes why the optimization matters in plain language.
            </p>
            <div className="mt-4 min-h-[120px] rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              {state.insight ?? "Run Optimize to request an insight."}
            </div>
          </section>

          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            <h2 className="text-lg font-semibold text-slate-900">Active Dataset</h2>
            <p>
              Forecast points loaded: <strong>{state.series.base.length}</strong>
            </p>
            {state.series.base.length > 0 ? (
              <p>
                Peak baseline load: {formatPower(Math.max(...state.series.base))}
              </p>
            ) : null}
            {state.error ? (
              <p className="text-sm font-medium text-red-600">{state.error}</p>
            ) : null}
          </section>
        </main>
      </div>
    </RequireAuth>
  );
}
