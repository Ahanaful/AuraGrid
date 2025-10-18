"use client";

import { useCallback, useState } from "react";
import { getForecast, getInsight, getOptimization } from "@/services/auragrid";
import type { OptimizeMetrics } from "@/types/api";
import { PLACEHOLDER_INSIGHT } from "@/lib/constants";

export type LoadingState = "idle" | "forecast" | "optimize" | "insight";

export type SeriesState = {
  base: number[];
  optimized: number[];
  renewable: number[];
  timestamps: string[];
};

interface AuraState {
  loading: LoadingState;
  error?: string;
  insight?: string;
  metrics?: OptimizeMetrics;
  series: SeriesState;
}

const initialSeries: SeriesState = {
  base: [],
  optimized: [],
  renewable: [],
  timestamps: [],
};

const initialState: AuraState = {
  loading: "idle",
  insight: PLACEHOLDER_INSIGHT,
  series: initialSeries,
};

export function useAuraApi() {
  const [state, setState] = useState<AuraState>(initialState);

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
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: "idle",
        error: error instanceof Error ? error.message : "Failed to load forecast",
      }));
    }
  }, [setLoading]);

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
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: "idle",
        error: error instanceof Error ? error.message : "Optimization failed",
      }));
    }
  }, [setLoading]);

  const fetchInsight = useCallback(async () => {
    if (!state.metrics) {
      setState((prev) => ({
        ...prev,
        error: "Run Optimize before requesting an insight.",
      }));
      return;
    }

    try {
      setLoading("insight");
      const result = await getInsight();
      setState((prev) => ({
        ...prev,
        loading: "idle",
        insight: result.summary,
        metrics: result.metrics ?? prev.metrics,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: "idle",
        error: error instanceof Error ? error.message : "Insight request failed",
      }));
    }
  }, [setLoading, state.metrics]);

  const reset = useCallback(() => {
    setState({
      loading: "idle",
      insight: PLACEHOLDER_INSIGHT,
      series: {
        base: [],
        optimized: [],
        renewable: [],
        timestamps: [],
      },
    });
  }, []);

  return {
    state,
    loadForecast,
    optimizeLoad,
    fetchInsight,
    reset,
  };
}
