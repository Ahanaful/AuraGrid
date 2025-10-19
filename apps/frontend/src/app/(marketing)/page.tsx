import Link from "next/link";
import { Header } from "@/components/common/Header";
import { buttonClassName } from "@/lib/buttonStyles";

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center hero-gradient text-white page-fade-in">
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-14 px-6 pb-20 pt-20 text-center">
        <section className="flex flex-col gap-6 glow-entrance">
          <h1 className="headline-glow text-4xl font-semibold leading-tight sm:text-5xl">
            Smarter scheduling for greener AI workloads.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
            AuraGrid forecasts grid load, renewables, and fossil fuel usage so data-center teams can move flexible workloads into cleaner, low-fossil windows, no infrastructure changes required.
          </p>
          <div className="cta-pulse flex flex-col items-center justify-center">
            <Link
              href="/app"
              className={buttonClassName("primary")}
            >
              View Dashboard
            </Link>
          </div>
        </section>

        <section className="card-fade-in card-float grid w-full gap-10 rounded-3xl border border-[rgba(120,168,255,0.15)] bg-[rgba(10,28,62,0.55)] p-10 shadow-2xl shadow-blue-900/40 backdrop-blur-xl">
          <div className="grid gap-3 text-center">
            <h2 className="text-2xl font-semibold text-white">Why AuraGrid?</h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
              Most independent data centers lack the tools hyperscalers use to
              align workloads with renewables. AuraGrid delivers the same
              intelligence through a lightweight Cloudflare Worker + Next.js
              stack tuned for edge reliability.
            </p>
          </div>
          <dl className="grid grid-cols-1 gap-8 text-left sm:grid-cols-2">
            <div className="card-fade-in card-float rounded-2xl border border-[rgba(120,168,255,0.18)] bg-[rgba(12,32,70,0.55)] p-6 backdrop-blur">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-200">
                Environmental Impact
              </dt>
              <dd className="mt-3 text-base leading-relaxed text-white/90">
                Shift energy-intensive jobs into renewable-rich hours to shrink
                carbon intensity.
              </dd>
            </div>
            <div className="card-fade-in card-float rounded-2xl border border-[rgba(120,168,255,0.18)] bg-[rgba(12,32,70,0.55)] p-6 backdrop-blur">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-200">
                Economic Benefit
              </dt>
              <dd className="mt-3 text-base leading-relaxed text-white/90">
                Leverage off-peak pricing to reduce energy spend without risking
                SLAs.
              </dd>
            </div>
            <div className="card-fade-in card-float rounded-2xl border border-[rgba(120,168,255,0.18)] bg-[rgba(12,32,70,0.55)] p-6 backdrop-blur">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-200">
                Operational Confidence
              </dt>
              <dd className="mt-3 text-base leading-relaxed text-white/90">
                Baseline vs optimized views show how we stay under peak guardrails
                while chasing the cleanest hours.
              </dd>
            </div>
            <div className="card-fade-in card-float rounded-2xl border border-[rgba(120,168,255,0.18)] bg-[rgba(12,32,70,0.55)] p-6 backdrop-blur">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-200">
                AI-ready Insights
              </dt>
              <dd className="mt-3 text-base leading-relaxed text-white/90">
                Workers AI summarizes carbon savings in plain language for quick
                leadership updates.
              </dd>
            </div>
          </dl>
        </section>
      </main>
      <footer className="w-full border-t border-white/10 py-6 text-center text-xs text-slate-300">
        © {new Date().getFullYear()} AuraGrid. Greener compute for every team.
      </footer>
    </div>
  );
}
