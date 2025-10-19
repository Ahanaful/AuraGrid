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
      <div className="page-fade-in flex min-h-screen flex-col items-center hero-gradient text-white">
        <Header />
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-12 px-6 pb-20 pt-24 text-center">
          <section className="glow-entrance flex flex-col items-center gap-5">
            <h1 className="headline-glow text-4xl font-semibold leading-tight sm:text-5xl">
              AuraGrid Forecast Console
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              Trigger the latest KV snapshot, run the optimization heuristic, and pull an AI summary
              to brief your ops team.
            </p>
            <div className="cta-pulse flex flex-wrap items-center justify-center gap-3 pt-2">
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
          </section>

          <LoadChart
            base={state.series.base}
            optimized={state.series.optimized}
            renewable={state.series.renewable}
            timestamps={state.series.timestamps}
            loading={state.loading === "forecast" || state.loading === "optimize"}
          />

          <section className="card-fade-in grid w-full gap-4 sm:grid-cols-3">
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

          <section className="card-fade-in w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-left text-white backdrop-blur-xl shadow-2xl shadow-teal-900/40">
            <h2 className="text-lg font-semibold text-white">AI Insight</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Workers AI summarizes why the optimization matters in plain language.
            </p>
            <div className="mt-4 min-h-[120px] rounded-2xl border border-dashed border-white/20 bg-white/5 p-5 text-sm leading-relaxed text-white/80">
              {state.insight ?? "Run Optimize to request an insight."}
            </div>
          </section>

          <section className="card-fade-in grid w-full gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 text-left text-sm text-white/80 backdrop-blur-xl shadow-2xl shadow-teal-900/40">
            <h2 className="text-lg font-semibold text-white">Active Dataset</h2>
            <p className="leading-relaxed">
              Forecast points loaded: <strong className="font-semibold text-white">{state.series.base.length}</strong>
            </p>
            {state.series.base.length > 0 ? (
              <p className="leading-relaxed">
                Peak baseline load: {formatPower(Math.max(...state.series.base))}
              </p>
            ) : null}
            {state.error ? (
              <p className="text-sm font-medium text-red-300">{state.error}</p>
            ) : null}
          </section>
        </main>
      </div>
    </RequireAuth>
  );
}
