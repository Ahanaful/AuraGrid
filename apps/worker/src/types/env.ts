import type { Ai } from "@cloudflare/workers-types";

export type Bindings = {
  auragrid_forecast: KVNamespace;
  AI: Ai;
};

export type AuraContext = {
  Bindings: Bindings;
};
