import type { CSSProperties } from "react";

interface ImpactCardProps {
  title: string;
  description: string;
  value: string;
  showWave?: boolean;
  fillPercent?: number | null;
}

export function ImpactCard({
  title,
  description,
  value,
  showWave = false,
  fillPercent = null,
}: ImpactCardProps) {
  const normalizedFill =
    typeof fillPercent === "number" && Number.isFinite(fillPercent)
      ? Math.max(0, Math.min(100, fillPercent))
      : null;

  const waveStyles: CSSProperties | undefined =
    showWave && normalizedFill !== null
      ? ({ "--impact-fill": normalizedFill } satisfies CSSProperties)
      : undefined;

  return (
    <article
      className={`impact-card card-fade-in card-float rounded-3xl border border-[rgba(120,168,255,0.18)] bg-[rgba(12,32,70,0.55)] p-6 text-left text-white backdrop-blur-xl transition-transform duration-500 ${
        showWave && normalizedFill !== null ? "impact-card--wave" : ""
      }`}
      style={waveStyles}
    >
      {showWave && normalizedFill !== null ? (
        <span aria-hidden className="impact-card__wave" />
      ) : null}
      <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
        {title}
      </h3>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{description}</p>
    </article>
  );
}
