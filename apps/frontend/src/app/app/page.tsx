"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/common/Header";
import { ImpactCard } from "@/components/cards/ImpactCard";
import { LoadChart } from "@/components/charts/LoadChart";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { useAuraApi } from "@/hooks/useAuraApi";
import { formatCo2, formatPower, formatHourLabel, formatDateWithWeekday } from "@/lib/formatting";

export default function DashboardPage() {
  const {
    state,
    loadForecast,
    optimizeLoad,
    fetchInsight,
    loadPlan,
    reoptimizePlan,
    reset,
  } = useAuraApi();

  const metrics = useMemo(
    () => state.metrics ?? state.plan?.metrics ?? null,
    [state.metrics, state.plan],
  );
  const planMetrics = state.plan?.metrics ?? null;
  const [activeAction, setActiveAction] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const actions = [
    {
      label: "Start Forecast",
      onPress: loadForecast,
      disabled: false,
      loading: state.loading === "forecast",
    },
    {
      label: "Optimize",
      onPress: optimizeLoad,
      disabled: !state.series.base.length,
      loading: state.loading === "optimize",
    },
    {
      label: "Generate Insight",
      onPress: fetchInsight,
      disabled: !metrics,
      loading: state.loading === "insight",
    },
    {
      label: "Reset",
      onPress: reset,
      disabled: false,
      loading: false,
    },
  ];
  const segmentCount = actions.length;
  const segmentWidth = `calc((100% - 0.5rem) / ${segmentCount})`;
  const highlightStyle = useMemo(
    () => ({
      width: segmentWidth,
      left: `calc(${activeAction} * ((100% - 0.5rem) / ${segmentCount}) + 0.25rem)`,
    }),
    [segmentCount, segmentWidth, activeAction],
  );

  useEffect(() => {
    if (state.loading === "forecast") {
      setActiveAction(0);
      setHasInteracted(true);
    } else if (state.loading === "optimize") {
      setActiveAction(1);
      setHasInteracted(true);
    } else if (state.loading === "insight") {
      setActiveAction(2);
      setHasInteracted(true);
    }
  }, [state.loading]);
  const intensityExtrema = useMemo(() => {
    const { intensity, timestamps } = state.series;
    if (!intensity.length || intensity.length !== timestamps.length) {
      return null;
    }

    let cleanIndex = 0;
    let dirtyIndex = 0;
    intensity.forEach((value, index) => {
      if (value < intensity[cleanIndex]) cleanIndex = index;
      if (value > intensity[dirtyIndex]) dirtyIndex = index;
    });

    return {
      clean: {
        value: intensity[cleanIndex],
        time: timestamps[cleanIndex],
      },
      dirty: {
        value: intensity[dirtyIndex],
        time: timestamps[dirtyIndex],
      },
    };
  }, [state.series]);

  const datasetRange = useMemo(() => {
    const timestamps = state.series.timestamps;
    if (!timestamps.length) return null;
    const first = timestamps[0];
    const last = timestamps[timestamps.length - 1];
    return {
      start: first,
      end: last,
    };
  }, [state.series.timestamps]);

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
              Load the latest forecast, shift flexible workloads into the cleanest hours, and brief
              your ops team on the avoided emissions in seconds.
            </p>
            <div className="cta-pulse flex justify-center pt-2">
              <div className="relative inline-flex w-full max-w-3xl items-center overflow-hidden rounded-full border-[2.25px] border-[rgba(120,168,255,0.28)] bg-[rgba(10,28,62,0.6)] p-1 text-base font-semibold tracking-tight text-white shadow-[0_10px_30px_rgba(66,182,255,0.16)] transition-transform duration-300 backdrop-blur">
                <span
                  aria-hidden="true"
                  style={highlightStyle}
                  className={`pointer-events-none absolute inset-y-1 rounded-full transition-[left,width] duration-500 ease-out ${
                    hasInteracted
                      ? "bg-[linear-gradient(140deg,rgba(79,205,255,0.95),rgba(156,227,255,0.88))]"
                      : "bg-[linear-gradient(140deg,rgba(58,128,202,0.9),rgba(120,186,240,0.85))]"
                  }`}
                />
                {actions.map((action, index) => {
                  const isActive = activeAction === index;
                  const isDisabled = action.disabled || action.loading;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => {
                        if (isDisabled) return;
                        setHasInteracted(true);
                        setActiveAction(index);
                        action.onPress();
                      }}
                      disabled={isDisabled}
                      aria-pressed={isActive}
                      className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                        isActive ? "text-slate-950" : "text-white/70 hover:text-white"
                      } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      {action.loading ? (
                        <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : null}
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <LoadChart
            base={state.series.base}
            optimized={state.series.optimized}
            renewable={state.series.renewable}
            timestamps={state.series.timestamps}
            intensity={state.series.intensity}
            loading={state.loading === "forecast" || state.loading === "optimize"}
          />

          <section className="card-fade-in w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-left text-white backdrop-blur-xl shadow-2xl shadow-teal-900/40">
            <h2 className="text-lg font-semibold text-white">Latest Carbon-Aware Plan</h2>
            <p className="mt-1 text-sm text-white/70">
              Plans persist in Cloudflare Durable Objects so you can review or re-apply the low-carbon schedule.
            </p>
            <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
              {state.plan ? (
                <>
                  <p className="text-sm text-white/70">
                    Version: <span className="font-semibold text-white">{state.plan.version}</span>
                  </p>
                  <div className="text-sm text-white/80">
                    CO₂ Avoided: {formatCo2(state.plan.metrics?.co2_avoided_kg ?? 0)}
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/70">
                  No persisted plan yet. Refresh to load the current Durable Object snapshot.
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => loadPlan()} loading={state.loading === "plan"}>
                Refresh Plan
              </Button>
              <Button
                onClick={reoptimizePlan}
                loading={state.loading === "reopt"}
                variant="secondary"
              >
                Reoptimize + Persist
              </Button>
            </div>
            <p className="mt-3 text-xs text-teal-200/70">
              Plans persist automatically in the Durable Object.
            </p>
          </section>
          <section className="card-fade-in grid w-full gap-4">
            <ImpactCard
              title="CO₂ Avoided"
              description="Daily savings versus the unshifted baseline."
              value={metrics ? formatCo2(metrics.co2_avoided_kg) : "—"}
            />
          </section>

        <section className="card-fade-in w-full rounded-3xl border border-[rgba(120,168,255,0.15)] bg-[rgba(10,28,62,0.55)] p-8 text-left text-white backdrop-blur-xl shadow-2xl shadow-blue-900/40">
            <h2 className="text-lg font-semibold text-white">AI Insight</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Workers AI summarizes why the optimization matters in plain language.
            </p>
            <div className="mt-4 min-h-[120px] rounded-2xl border border-dashed border-white/20 bg-white/5 p-5 text-sm leading-relaxed text-white/80">
              {state.insight ?? "Run Optimize to request an insight."}
            </div>
          </section>

          <section className="card-fade-in grid w-full gap-4 rounded-3xl border border-[rgba(120,168,255,0.15)] bg-[rgba(10,28,62,0.55)] p-8 text-left text-sm text-white/80 backdrop-blur-xl shadow-2xl shadow-blue-900/40">
            <h2 className="text-lg font-semibold text-white">Active Dataset</h2>
            <p className="leading-relaxed">
              Forecast points loaded: <strong className="font-semibold text-white">{state.series.base.length}</strong>
            </p>
            
            {state.series.base.length > 0 ? (
              <p className="leading-relaxed">
                Peak baseline load: {formatPower(Math.max(...state.series.base))}
              </p>
            ) : null}
            {intensityExtrema ? (
              <div className="space-y-1 text-xs leading-relaxed text-white/70">
                <p>
                  Cleanest hour: <strong className="text-white">{formatDateWithWeekday(intensityExtrema.clean.time)}</strong>{" "}
                  ({Math.round(intensityExtrema.clean.value)} kg CO₂/MWh)
                </p>
                <p>
                  Dirtiest hour: <strong className="text-white">{formatDateWithWeekday(intensityExtrema.dirty.time)}</strong>{" "}
                  ({Math.round(intensityExtrema.dirty.value)} kg CO₂/MWh)
                </p>
              </div>
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
