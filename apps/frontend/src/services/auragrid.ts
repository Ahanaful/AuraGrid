import { API_ROUTES } from "@/lib/constants";
import { withWorkerBase } from "@/lib/env";
import type {
  ForecastRow,
  InsightResponse,
  OptimizeResponse,
  PlanPayload,
  PlanResponse,
  OptimizeMetrics,
} from "@/types/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Request failed with ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function getForecast(): Promise<ForecastRow[]> {
  const res = await fetch(withWorkerBase(API_ROUTES.forecast), {
    cache: "no-store",
  });
  return handleResponse<ForecastRow[]>(res);
}

export async function getOptimization(): Promise<OptimizeResponse> {
  const res = await fetch(withWorkerBase(API_ROUTES.optimize), {
    cache: "no-store",
  });
  return handleResponse<OptimizeResponse>(res);
}

export async function getInsight(): Promise<InsightResponse> {
  const res = await fetch(withWorkerBase(API_ROUTES.insight), {
    cache: "no-store",
  });
  return handleResponse<InsightResponse>(res);
}

export async function getPlan(): Promise<PlanResponse> {
  const res = await fetch(withWorkerBase("/api/plan"), { cache: "no-store" });
  return handleResponse<PlanResponse>(res);
}

export async function applyPlan(
  payload: PlanPayload,
  tenant = "demo",
) {
  const res = await fetch(withWorkerBase("/api/apply"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ payload, tenant }),
  });
  return handleResponse<{ ok: boolean; version: number }>(res);
}

export async function reoptimize(): Promise<{
  ok: boolean;
  metrics: OptimizeMetrics;
  version: number;
}> {
  const res = await fetch(withWorkerBase("/api/reoptimize"), {
    method: "POST",
  });
  return handleResponse(res);
}
