export async function summarize(AI: any, metrics: {
  peak_reduction_pct: number;
  renewable_gain_pct: number;
  co2_avoided_kg: number;
}) {
  const prompt = `
You are advising a data center SRE.
Metrics: ${JSON.stringify(metrics)}
In 2 short sentences, say when to shift jobs and why this reduces emissions/peaks.
Keep it under 45 words.
`.trim();

  const res = await AI.run("@cf/meta/llama-3.1-8b-instruct", { prompt });
  const summary = res?.response ?? String(res);
  return { summary, metrics };
}
