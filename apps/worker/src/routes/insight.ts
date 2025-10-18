import { Hono } from "hono";
import { summarize } from "../adapters/ai";

export const insight = new Hono<{ Bindings: { AI: any } }>();

insight.get("/api/insight", async (c) => {
  const here = new URL(c.req.url);
  const optRes = await fetch(new URL("/api/optimize", here).toString());
  if (!optRes.ok) return c.json({ summary: "", metrics: {} }, 200);
  const opt = await optRes.json() as any;

  const { summary, metrics } = await summarize(c.env.AI, opt.metrics);
  return c.json({ summary, metrics });
});
