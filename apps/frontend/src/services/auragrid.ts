import { API_ROUTES } from "@/lib/constants";
import { withWorkerBase } from "@/lib/env";
import type {
  ForecastRow,
  InsightResponse,
  OptimizeResponse,
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
