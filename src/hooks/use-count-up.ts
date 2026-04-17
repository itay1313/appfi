import { useEffect, useRef, useState } from "react";

/**
 * Animates a numeric value from 0 → target whenever `enabled` flips to true.
 * Uses ease-out-expo for a snappy feel (fast start, gentle finish).
 *
 * @param target  - The final numeric value to count up to.
 * @param enabled - Start/restart the animation when this becomes true.
 *                  While false the returned value stays at 0 (shows skeleton).
 * @param duration - Animation length in ms (default 1 200).
 */
export function useCountUp(
  target: number,
  enabled: boolean,
  duration = 1200
): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);
  const startTsRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset to 0 while loading; cancel any in-progress animation.
    if (!enabled) {
      cancelAnimationFrame(rafRef.current);
      startTsRef.current = null;
      setValue(0);
      return;
    }

    // Data arrived — kick off animation from 0 → target.
    cancelAnimationFrame(rafRef.current);
    startTsRef.current = null;

    const animate = (ts: number) => {
      if (startTsRef.current === null) startTsRef.current = ts;

      const elapsed = ts - startTsRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out-expo: fast burst, feathers into the final value.
      const ease =
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setValue(target * ease);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target); // guarantee exact final value
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [target, enabled, duration]);

  return value;
}
