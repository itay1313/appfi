import { useEffect, useRef, useState } from "react";

/**
 * Animates a numeric value toward `target` using ease-out-expo.
 *
 * Behaviour:
 *  - While `enabled` is false: resets to 0 instantly (skeleton state).
 *  - On first enable (0 → target): full `duration` ms count-up.
 *  - On subsequent target changes (filter switch): animates FROM the current
 *    displayed value so there's no jarring reset to 0.
 *
 * @param target   - The final numeric value to animate toward.
 * @param enabled  - Animation runs while true; resets to 0 when false.
 * @param duration - Animation length in ms (default 500).
 */
export function useCountUp(
  target: number,
  enabled: boolean,
  duration = 500
): number {
  const [value, setValue] = useState(0);
  const rafRef   = useRef(0);
  // Tracks the value we're animating FROM (updated each frame).
  const fromRef  = useRef(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      cancelAnimationFrame(rafRef.current);
      fromRef.current  = 0;
      startRef.current = null;
      setValue(0);
      return;
    }

    // Cancel any in-progress animation and snapshot current position.
    cancelAnimationFrame(rafRef.current);
    const from = fromRef.current; // may be mid-way through a previous tween
    startRef.current = null;

    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;

      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const next = from + (target - from) * ease;

      fromRef.current = next; // keep in sync so interruptions start mid-value
      setValue(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        fromRef.current = target;
        setValue(target); // guarantee exact final value
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [target, enabled, duration]);

  return value;
}
