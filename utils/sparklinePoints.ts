const PADDING = 4;
const MIN_SCALE_MAX = 40;

/** Builds an SVG polyline `points` string for a series, scaled to the given box. Empty series yields "". */
export function sparklinePoints(values: readonly number[], width: number, height: number): string {
  if (values.length === 0) return "";
  const max = Math.max(MIN_SCALE_MAX, ...values);
  const usable = height - PADDING * 2;
  const toY = (v: number) => height - PADDING - (v / max) * usable;
  const fmt = (n: number) => Number(n.toFixed(2));
  if (values.length === 1) {
    const y = fmt(toY(values[0]));
    return `0,${y} ${width},${y}`;
  }
  const step = width / (values.length - 1);
  return values.map((v, i) => `${fmt(i * step)},${fmt(toY(v))}`).join(" ");
}
