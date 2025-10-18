import { Hono } from "hono";
import { forecastRoutes } from "@/routes/forecast";
import { optimizeRoutes } from "@/routes/optimize";
import { insightRoutes } from "@/routes/insight";
import type { AuraContext } from "@/types/env";

const app = new Hono<AuraContext>();

app.route("/", forecastRoutes);
app.route("/", optimizeRoutes);
app.route("/", insightRoutes);

export default app;
