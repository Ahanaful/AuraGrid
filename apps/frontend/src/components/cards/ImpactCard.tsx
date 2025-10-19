interface ImpactCardProps {
  title: string;
  description: string;
  value: string;
}

export function ImpactCard({ title, description, value }: ImpactCardProps) {
  return (
    <article className="card-fade-in card-float rounded-3xl border border-white/10 bg-white/5 p-6 text-left text-white backdrop-blur-xl transition-transform duration-500">
      <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
        {title}
      </h3>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{description}</p>
    </article>
  );
}
