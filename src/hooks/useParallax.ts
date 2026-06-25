import { useEffect, useRef } from "react";

/**
 * Smoothed pointer-parallax. Tracks the pointer relative to the target's centre
 * and writes eased `--mx`/`--my` CSS variables (range ≈ -1..1) onto the element
 * each frame, so child layers can translate by `calc(var(--mx) * <depth>)` to
 * produce a subtle dynamic-camera shift. Lerping gives the motion weight rather
 * than a rigid 1:1 follow. No-op (vars pinned to 0) when disabled.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  enabled: boolean,
  intensity = 1,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!enabled) {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let raf = 0;
    let running = true;

    const clamp = (n: number) => Math.max(-1, Math.min(1, n));

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      targetX = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2));
      targetY = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2));
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const loop = () => {
      curX += (targetX - curX) * 0.055;
      curY += (targetY - curY) * 0.055;
      el.style.setProperty("--mx", (curX * intensity).toFixed(4));
      el.style.setProperty("--my", (curY * intensity).toFixed(4));
      if (running) raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, intensity]);

  return ref;
}
