/** True when the user asked the OS/browser to reduce motion. Safe where matchMedia is missing (SSR, jsdom). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
