import Link from "next/link";
import { Header } from "@/components/common/Header";

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col hero-gradient text-white">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 pb-16 pt-20">
        <section className="flex flex-col gap-6 text-center sm:text-left">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-300">
            Forecast. Shift. Sustain.
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Carbon-aware scheduling for every AI cluster.
          </h1>
          <p className="max-w-2xl text-lg text-slate-200">
            AuraGrid forecasts load, renewables, and carbon intensity so data
            center teams can move flexible workloads into greener windows—no
            infrastructure rewrites required.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full bg-teal-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-teal-400/30 transition-transform hover:-translate-y-0.5 hover:bg-teal-300"
            >
              Start Forecast
            </Link>
            <Link
              href="#impact"
              className="text-sm font-medium text-slate-200 underline-offset-4 hover:underline"
            >
              See impact metrics
            </Link>
          </div>
        </section>

        <section className="grid gap-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl backdrop-blur-lg">
          <div className="grid gap-2">
            <h2 className="text-xl font-semibold text-white">Why AuraGrid?</h2>
            <p className="text-sm text-slate-300">
              Most independent data centers lack the tools hyperscalers use to
              align workloads with renewables. AuraGrid delivers the same
              intelligence through a lightweight Cloudflare Worker + Next.js
              stack tuned for edge reliability.
            </p>
          </div>
          <dl className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">
                Environmental Impact
              </dt>
              <dd className="mt-1 text-base text-white">
                Shift energy-intensive jobs into renewable-rich hours to shrink
                carbon intensity.
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">
                Economic Benefit
              </dt>
              <dd className="mt-1 text-base text-white">
                Leverage off-peak pricing to reduce energy spend without risking
                SLAs.
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">
                Operational Confidence
              </dt>
              <dd className="mt-1 text-base text-white">
                Baseline vs optimized forecasts visualize peak shaving in
                minutes.
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">
                AI-ready Insights
              </dt>
              <dd className="mt-1 text-base text-white">
                Workers AI summarizes carbon savings in plain language for quick
                leadership updates.
              </dd>
            </div>
          </dl>
        </section>

        <section id="impact" className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <h2 className="text-xl font-semibold text-white">Team Snapshot</h2>
          <ul className="grid list-disc gap-2 pl-5 text-sm text-slate-200">
            <li>Backend Worker: Hono routes for forecast, optimize, insight.</li>
            <li>Frontend Dashboard: Next.js App Router + Tailwind + Recharts.</li>
            <li>LLM Insights: Workers AI (Llama 3.1 8B) for narrative context.</li>
            <li>Offline Forecasts: Prophet script uploads to Cloudflare KV.</li>
          </ul>
        </section>
      </main>
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AuraGrid. Greener compute for every team.
      </footer>
    </div>
  );
}
