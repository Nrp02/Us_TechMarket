const price = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return `$${price.format(value)}`;
}

export function formatChange(value: number): string {
  return `${value >= 0 ? "+" : "−"}${price.format(Math.abs(value))}`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : "−"}${price.format(Math.abs(value))}%`;
}

export function formatVolume(value: number | null): string {
  if (value == null) return "—";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

export function formatRelVolume(value: number | null): string {
  return value == null ? "—" : `${value.toFixed(2)}x`;
}
