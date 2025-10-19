"use client";

import { useCallback, useState } from "react";
import {
  applyPlan,
  getForecast,
  getInsight,
  getOptimization,
  getPlan,
  reoptimize,
} from "@/services/auragrid";
import type { OptimizeMetrics, PlanPayload } from "@/types/api";
import { PLACEHOLDER_INSIGHT } from "@/lib/constants";
import { useToast } from "@/components/ui/ToastProvider";

export type LoadingState =
  | "idle"
  | "forecast"
  | "optimize"
  | "insight"
  | "plan"
  | "reopt"
  | "apply";

export type SeriesState = {
  base: number[];
  optimized: number[];
  renewable: number[];
  timestamps: string[];
  intensity: number[];
};

interface AuraState {
  loading: LoadingState;
  error?: string;
  insight?: string;
  metrics?: OptimizeMetrics;
  series: SeriesState;
  plan?: PlanPayload | null;
}

const initialSeries: SeriesState = {
  base: [],
  optimized: [],
  renewable: [],
  timestamps: [],
  intensity: [],
};

const initialState: AuraState = {
  loading: "idle",
  insight: PLACEHOLDER_INSIGHT,
  series: initialSeries,
};

export function useAuraApi() {
  const [state, setState] = useState<AuraState>(initialState);
  const { pushToast } = useToast();

  const setLoading = useCallback((loading: LoadingState) => {
    setState((prev) => ({ ...prev, loading, error: undefined }));
  }, []);

  const loadForecast = useCallback(async () => {
    try {
      setLoading("forecast");
      const rows = await getForecast();
      const base = rows.map((row) => row.load_pred_mw ?? 0);
      const renewable = rows.map(
        (row) => (row.solar_mw ?? 0) + (row.wind_mw ?? 0),
      );
      const timestamps = rows.map((row) => row.ds);
      const intensity = rows.map((row) => row.carbon_intensity_kg_per_mwh ?? null);

      setState((prev) => ({
        ...prev,
        loading: "idle",
        error: undefined,
        metrics: undefined,
        insight: PLACEHOLDER_INSIGHT,
        series: {
          base,
          optimized: base,
          renewable,
          timestamps,
          intensity,
        },
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load forecast";
      pushToast({ variant: "error", message });
      setState((prev) => ({
        ...prev,
        loading: "idle",
        error: message,
      }));
    }
  }, [pushToast, setLoading]);

  const optimizeLoad = useCallback(async () => {
    try {
      setLoading("optimize");
      const response = await getOptimization();
      setState((prev) => ({
        ...prev,
        loading: "idle",
        metrics: response.metrics,
        insight: PLACEHOLDER_INSIGHT,
        series: {
          base: response.base,
          optimized: response.optimized,
          renewable: response.renewable,
          timestamps: prev.series.timestamps,
          intensity: response.intensity ?? prev.series.intensity,
        },
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Optimization failed";
      pushToast({ variant: "error", message });
      setState((prev) => ({
        ...prev,
        loading: "idle",
        error: message,
      }));
    }
  }, [pushToast, setLoading]);

  const fetchInsight = useCallback(async () => {
    try {
      setLoading("insight");
      const result = await getInsight();
      setState((prev) => ({
        ...prev,
        loading: "idle",
        insight: result.summary,
        metrics: result.metrics ?? prev.metrics ?? prev.plan?.metrics,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Insight request failed";
      pushToast({ variant: "error", message });
      setState((prev) => ({
        ...prev,
        loading: "idle",
        error: message,
      }));
    }
  }, [pushToast, setLoading]);

  const loadPlan = useCallback(async () => {
    try {
      setLoading("plan");
      const plan = await getPlan();
      setState((prev) => ({
        ...prev,
        loading: "idle",
        plan,
        metrics: plan?.metrics ?? prev.metrics,
      }));
      pushToast({ variant: "success", message: "Plan refreshed." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load plan";
      pushToast({ variant: "error", message });
      setState((prev) => ({
        ...prev,
        loading: "idle",
        error: message,
      }));
    }
  }, [pushToast, setLoading]);

  const reoptimizePlan = useCallback(async () => {
    try {
      setLoading("reopt");
      const result = await reoptimize();
      await loadPlan();
      setState((prev) => ({
        ...prev,
        loading: "idle",
        metrics: result.metrics,
        insight: PLACEHOLDER_INSIGHT,
      }));
      pushToast({ variant: "success", message: "Plan reoptimized." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Reoptimization failed";
      pushToast({ variant: "error", message });
      setState((prev) => ({
        ...prev,
        loading: "idle",
        error: message,
      }));
    }
  }, [loadPlan, pushToast, setLoading]);

  const applyCurrentPlan = useCallback(
    async () => {
      if (!state.plan) {
        const message = "No plan loaded to apply.";
        pushToast({ variant: "error", message });
        setState((prev) => ({
          ...prev,
          error: message,
        }));
        return;
      }

      try {
        setLoading("apply");
        await applyPlan(state.plan);
        setState((prev) => ({
          ...prev,
          loading: "idle",
        }));
        pushToast({ variant: "success", message: "Plan applied." });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to apply the plan";
        pushToast({ variant: "error", message });
        setState((prev) => ({
          ...prev,
          loading: "idle",
          error: message,
        }));
      }
    },
    [pushToast, setLoading, state.plan],
  );

  const reset = useCallback(() => {
    setState({
      loading: "idle",
      insight: PLACEHOLDER_INSIGHT,
      series: {
        base: [],
        optimized: [],
        renewable: [],
        timestamps: [],
        intensity: [],
      },
    });
  }, []);

  return {
    state,
    loadForecast,
    optimizeLoad,
    fetchInsight,
    loadPlan,
    reoptimizePlan,
    applyCurrentPlan,
    reset,
  };
}
