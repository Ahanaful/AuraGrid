import type { Ai } from "@cloudflare/workers-types";

export type Bindings = {
  FORECAST_KV: KVNamespace;
  AI: Ai;
};

export type AuraContext = {
  Bindings: Bindings;
};
