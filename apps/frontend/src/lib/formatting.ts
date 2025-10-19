const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const co2Formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "—";
  return `${percentFormatter.format(value)}%`;
}

export function formatPower(value: number) {
  if (!Number.isFinite(value)) return "—";
  return `${numberFormatter.format(value)} MW`;
}

export function formatCo2(value: number) {
  if (!Number.isFinite(value)) return "—";
  return `${co2Formatter.format(value)} kg`; // daily avoided CO₂
}

export function formatHourLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
  });
}
