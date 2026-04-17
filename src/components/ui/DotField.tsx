/**
 * DotField animated background — adapted from react-bits (MIT).
 * Interactive dot grid with cursor-reactive bulge effect, pure canvas.
 * @see https://reactbits.dev/backgrounds/dot-field
 */
import { useEffect, useRef, memo, type CSSProperties } from "react";

const TWO_PI = Math.PI * 2;

interface Dot {
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

export interface DotFieldProps {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  cursorForce?: number;
  bulgeOnly?: boolean;
  bulgeStrength?: number;
  glowRadius?: number;
  sparkle?: boolean;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  className?: string;
  style?: CSSProperties;
}

export const DotField = memo(function DotField({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 500,
  cursorForce = 0.1,
  bulgeOnly = true,
  bulgeStrength = 67,
  glowRadius = 160,
  sparkle = false,
  waveAmplitude = 0,
  gradientFrom = "rgba(168, 85, 247, 0.35)",
  gradientTo = "rgba(180, 151, 207, 0.25)",
  glowColor = "#120F17",
  className,
  style,
}: DotFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({
    x: -9999,
    y: -9999,
    prevX: -9999,
    prevY: -9999,
    speed: 0,
  });
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, offsetX: 0, offsetY: 0 });
  const glowOpacity = useRef(0);
  const engagement = useRef(0);
  const propsRef = useRef({
    dotRadius,
    dotSpacing,
    cursorRadius,
    cursorForce,
    bulgeOnly,
    bulgeStrength,
    sparkle,
    waveAmplitude,
    gradientFrom,
    gradientTo,
  });
  propsRef.current = {
    dotRadius,
    dotSpacing,
    cursorRadius,
    cursorForce,
    bulgeOnly,
    bulgeStrength,
    sparkle,
    waveAmplitude,
    gradientFrom,
    gradientTo,
  };
  const glowId = useRef(
    `dot-field-glow-${Math.random().toString(36).slice(2, 9)}`
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const glowEl = glowRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let cachedGrad: CanvasGradient | null = null;
    let cachedGradKey = "";

    function getGradient(w: number, h: number, from: string, to: string) {
      const key = `${w}:${h}:${from}:${to}`;
      if (key !== cachedGradKey) {
        cachedGrad = ctx.createLinearGradient(0, 0, w, h);
        cachedGrad.addColorStop(0, from);
        cachedGrad.addColorStop(1, to);
        cachedGradKey = key;
      }
      return cachedGrad!;
    }

    function setup(w: number, h: number) {
      if (w === 0 || h === 0) return;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rect = container!.getBoundingClientRect();
      sizeRef.current = {
        w,
        h,
        offsetX: rect.left + window.scrollX,
        offsetY: rect.top + window.scrollY,
      };
      cachedGradKey = "";
      buildDots(w, h);
    }

    function buildDots(w: number, h: number) {
      const p = propsRef.current;
      const step = p.dotRadius + p.dotSpacing;
      const cols = Math.floor(w / step);
      const rows = Math.floor(h / step);
      const padX = (w % step) / 2;
      const padY = (h % step) / 2;
      const dots: Dot[] = new Array(rows * cols);
      let idx = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          dots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
        }
      }
      dotsRef.current = dots;
    }

    function onMouseMove(e: MouseEvent) {
      const s = sizeRef.current;
      mouseRef.current.x = e.pageX - s.offsetX;
      mouseRef.current.y = e.pageY - s.offsetY;
    }

    function updateMouseSpeed() {
      const m = mouseRef.current;
      const dx = m.prevX - m.x;
      const dy = m.prevY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.speed += (dist - m.speed) * 0.5;
      if (m.speed < 0.001) m.speed = 0;
      m.prevX = m.x;
      m.prevY = m.y;
    }

    const speedInterval = setInterval(updateMouseSpeed, 100);
    let frameCount = 0;
    let isSettled = false;
    let idleFrames = 0;

    function drawStaticFrame() {
      const dots = dotsRef.current;
      const { w, h } = sizeRef.current;
      const p = propsRef.current;
      const len = dots.length;
      if (len === 0) return;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = getGradient(w, h, p.gradientFrom, p.gradientTo);
      const rad = p.dotRadius / 2;

      ctx.beginPath();
      for (let i = 0; i < len; i++) {
        const d = dots[i];
        ctx.moveTo(d.ax + rad, d.ay);
        ctx.arc(d.ax, d.ay, rad, 0, TWO_PI);
      }
      ctx.fill();
    }

    function tick() {
      frameCount++;
      const dots = dotsRef.current;
      const m = mouseRef.current;
      const { w, h } = sizeRef.current;
      const p = propsRef.current;
      const len = dots.length;
      const t = frameCount * 0.02;

      if (len === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const targetEngagement = Math.min(m.speed / 5, 1);
      engagement.current += (targetEngagement - engagement.current) * 0.06;
      if (engagement.current < 0.001) engagement.current = 0;
      const eng = engagement.current;

      if (eng < 0.001 && p.waveAmplitude === 0) {
        idleFrames++;
        if (idleFrames > 30) {
          if (!isSettled) {
            drawStaticFrame();
            isSettled = true;
          }
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      } else {
        idleFrames = 0;
        isSettled = false;
      }

      glowOpacity.current += (eng - glowOpacity.current) * 0.08;
      if (glowEl) {
        glowEl.setAttribute("cx", String(m.x));
        glowEl.setAttribute("cy", String(m.y));
        glowEl.style.opacity = String(glowOpacity.current);
      }

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = getGradient(w, h, p.gradientFrom, p.gradientTo);

      const cr = p.cursorRadius;
      const crSq = cr * cr;
      const rad = p.dotRadius / 2;
      const isBulge = p.bulgeOnly;

      ctx.beginPath();

      for (let i = 0; i < len; i++) {
        const d = dots[i];
        const dx = m.x - d.ax;
        const dy = m.y - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq && eng > 0.01) {
          const dist = Math.sqrt(distSq);
          if (isBulge) {
            const frac = 1 - dist / cr;
            const push = frac * frac * p.bulgeStrength * eng;
            const angle = Math.atan2(dy, dx);
            d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
            d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
          } else {
            const angle = Math.atan2(dy, dx);
            const move = (500 / dist) * (m.speed * p.cursorForce);
            d.vx += Math.cos(angle) * -move;
            d.vy += Math.sin(angle) * -move;
          }
        } else if (isBulge) {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }

        if (!isBulge) {
          d.vx *= 0.9;
          d.vy *= 0.9;
          d.x = d.ax + d.vx;
          d.y = d.ay + d.vy;
          d.sx += (d.x - d.sx) * 0.1;
          d.sy += (d.y - d.sy) * 0.1;
        }

        let drawX = d.sx;
        let drawY = d.sy;
        if (p.waveAmplitude > 0) {
          drawY += Math.sin(d.ax * 0.03 + t) * p.waveAmplitude;
          drawX += Math.cos(d.ay * 0.03 + t * 0.7) * p.waveAmplitude * 0.5;
        }

        if (p.sparkle) {
          const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
          if (hash % 100 < 3) {
            ctx.moveTo(drawX + rad * 1.8, drawY);
            ctx.arc(drawX, drawY, rad * 1.8, 0, TWO_PI);
          } else {
            ctx.moveTo(drawX + rad, drawY);
            ctx.arc(drawX, drawY, rad, 0, TWO_PI);
          }
        } else {
          ctx.moveTo(drawX + rad, drawY);
          ctx.arc(drawX, drawY, rad, 0, TWO_PI);
        }
      }

      ctx.fill();
      rafRef.current = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setup(width, height);
        }
      }
    });
    ro.observe(container);

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let animating = false;

    const startAnimation = () => {
      if (animating) return;
      animating = true;
      drawStaticFrame();
      rafRef.current = requestAnimationFrame(tick);
    };

    const pauseAnimation = () => {
      animating = false;
      cancelAnimationFrame(rafRef.current);
    };

    // Pause when the browser tab is hidden → restores main-thread budget.
    const onVisibilityChange = () => {
      if (document.hidden) pauseAnimation();
      else startAnimation();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Pause when the hero scrolls out of view → saves CPU on long pages.
    const io = new IntersectionObserver(
      ([entry]) => { entry.isIntersecting ? startAnimation() : pauseAnimation(); },
      { threshold: 0 }
    );
    io.observe(container);

    let cancelIdle: () => void;
    if (typeof requestIdleCallback !== "undefined") {
      const idleId = requestIdleCallback(startAnimation);
      cancelIdle = () => cancelIdleCallback(idleId);
    } else {
      const timerId = setTimeout(startAnimation, 200);
      cancelIdle = () => clearTimeout(timerId);
    }

    return () => {
      pauseAnimation();
      clearInterval(speedInterval);
      cancelIdle();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("mousemove", onMouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const p = propsRef.current;
      const step = p.dotRadius + p.dotSpacing;
      const cols = Math.floor(rect.width / step);
      const rows = Math.floor(rect.height / step);
      const padX = (rect.width % step) / 2;
      const padY = (rect.height % step) / 2;
      const dots: Dot[] = new Array(rows * cols);
      let idx = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          dots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
        }
      }
      dotsRef.current = dots;
    }
  }, [dotRadius, dotSpacing]);

  const mergedStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    ...style,
  };

  return (
    <div ref={containerRef} className={className} style={mergedStyle} aria-hidden="true" role="presentation">
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      >
        <defs>
          <radialGradient id={glowId.current}>
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle
          ref={glowRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill={`url(#${glowId.current})`}
          style={{ opacity: 0, willChange: "opacity" }}
        />
      </svg>
    </div>
  );
});
