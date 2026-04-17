import { useMemo, useEffect, useState } from "react";
import { DotField } from "@/components/ui/DotField";
import { useTheme } from "@/hooks/use-theme";

/**
 * Reads a CSS custom property from :root and re-fires whenever the
 * theme class changes (i.e. dark ↔ light toggle).
 */
function useCSSVar(token: string): string {
  const [value, setValue] = useState(() =>
    typeof document !== "undefined"
      ? getComputedStyle(document.documentElement)
          .getPropertyValue(token)
          .trim()
      : ""
  );

  useEffect(() => {
    const update = () =>
      setValue(
        getComputedStyle(document.documentElement)
          .getPropertyValue(token)
          .trim()
      );
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => mo.disconnect();
  }, [token]);

  return value;
}

/** Strips wrapper and alpha from an oklch() string → bare "L C H" channels */
function oklchChannels(raw: string): string {
  return raw
    .replace(/^oklch\(\s*/, "")
    .replace(/\s*\)$/, "")
    .replace(/\s*\/\s*[\d.]+$/, "")
    .trim();
}

const CHATGPT_ICON_DARK = (
  <svg viewBox="0 0 512 512" className="size-12 sm:size-14" fill="none">
    <rect width="512" height="512" rx="110" fill="white" />
    <path
      d="M388.8 209.4c7.6-22.6 4.4-47.8-8.6-67.6-19.6-30-54.4-44.6-88.8-38.2-15.6-18.4-38.8-29-63-29h-1.4c-33.2.4-63 20.2-76 50.4-23.4 4.8-42.8 21-52.2 43.2-13.4 31.4-7.2 67.8 15.8 92.4-7.6 22.6-4.4 47.8 8.6 67.6 19.6 30 54.4 44.6 88.8 38.2 15.6 18.4 38.8 29 63 29h1.4c33.2-.4 63-20.2 76-50.4 23.4-4.8 42.8-21 52.2-43.2 13.4-31.4 7.2-67.8-15.8-92.4zm-155 202.6c-22.2 0-38.8-9.2-49.4-18.4l2.8-1.6 65.6-37.8c3.4-2 5.4-5.6 5.4-9.4v-92.4l27.8 16c.2.2.4.4.4.6v76.6c0 36.6-29.8 66.4-52.6 66.4zm-113.6-61c-11-19.2-15-41.4-9.4-63l2.8 1.6 65.6 37.8c3.4 2 7.4 2 10.8 0l80-46.2v32c0 .4-.2.8-.4 1l-66.2 38.2c-31.6 18.4-72.2 7.4-83.2-1.4zm-14.8-154c11-19.2 28.6-32.2 48.8-37v78c0 3.8 2 7.4 5.4 9.4l80 46.2-27.8 16c-.4.2-.8.2-1.2 0l-66.2-38.2c-31.6-18.2-43.2-58.2-39-74.4zm195.6 45.4-80-46.2 27.8-16c.4-.2.8-.2 1.2 0l66.2 38.2c31.8 18.4 48.8 54.2 39.2 88.4v-1.4c0-.4 0-.8-.2-1V193c0-3.8-2-7.4-5.4-9.4-.2 0 .2 13.8-48.8 58.8zm27.6-63.2-2.8-1.6-65.6-37.8c-3.4-2-7.4-2-10.8 0l-80 46.2v-32c0-.4.2-.8.4-1l66.2-38.2c31.8-18.2 72-7.2 88.8 24.8 7.4 14 9.4 29.4 3.8 39.6zM220 289.4l-27.8-16c-.2-.2-.4-.4-.4-.6v-76.6c0-36.8 30-66.6 66.8-66.6 14 0 27.4 4.2 38.8 12.2v3.4l-65.6 37.8c-3.4 2-5.4 5.6-5.4 9.4l-6.4 97zm15.2-32.4 35.6-20.6 35.6 20.6v41l-35.6 20.6-35.6-20.6z"
      fill="black"
    />
  </svg>
);

const CHATGPT_ICON_LIGHT = (
  <svg viewBox="0 0 512 512" className="size-12 sm:size-14" fill="none">
    <rect width="512" height="512" rx="110" fill="black" />
    <path
      d="M388.8 209.4c7.6-22.6 4.4-47.8-8.6-67.6-19.6-30-54.4-44.6-88.8-38.2-15.6-18.4-38.8-29-63-29h-1.4c-33.2.4-63 20.2-76 50.4-23.4 4.8-42.8 21-52.2 43.2-13.4 31.4-7.2 67.8 15.8 92.4-7.6 22.6-4.4 47.8 8.6 67.6 19.6 30 54.4 44.6 88.8 38.2 15.6 18.4 38.8 29 63 29h1.4c33.2-.4 63-20.2 76-50.4 23.4-4.8 42.8-21 52.2-43.2 13.4-31.4 7.2-67.8-15.8-92.4zm-155 202.6c-22.2 0-38.8-9.2-49.4-18.4l2.8-1.6 65.6-37.8c3.4-2 5.4-5.6 5.4-9.4v-92.4l27.8 16c.2.2.4.4.4.6v76.6c0 36.6-29.8 66.4-52.6 66.4zm-113.6-61c-11-19.2-15-41.4-9.4-63l2.8 1.6 65.6 37.8c3.4 2 7.4 2 10.8 0l80-46.2v32c0 .4-.2.8-.4 1l-66.2 38.2c-31.6 18.4-72.2 7.4-83.2-1.4zm-14.8-154c11-19.2 28.6-32.2 48.8-37v78c0 3.8 2 7.4 5.4 9.4l80 46.2-27.8 16c-.4.2-.8.2-1.2 0l-66.2-38.2c-31.6-18.2-43.2-58.2-39-74.4zm195.6 45.4-80-46.2 27.8-16c.4-.2.8-.2 1.2 0l66.2 38.2c31.8 18.4 48.8 54.2 39.2 88.4v-1.4c0-.4 0-.8-.2-1V193c0-3.8-2-7.4-5.4-9.4-.2 0 .2 13.8-48.8 58.8zm27.6-63.2-2.8-1.6-65.6-37.8c-3.4-2-7.4-2-10.8 0l-80 46.2v-32c0-.4.2-.8.4-1l66.2-38.2c31.8-18.2 72-7.2 88.8 24.8 7.4 14 9.4 29.4 3.8 39.6zM220 289.4l-27.8-16c-.2-.2-.4-.4-.4-.6v-76.6c0-36.8 30-66.6 66.8-66.6 14 0 27.4 4.2 38.8 12.2v3.4l-65.6 37.8c-3.4 2-5.4 5.6-5.4 9.4l-6.4 97zm15.2-32.4 35.6-20.6 35.6 20.6v41l-35.6 20.6-35.6-20.6z"
      fill="white"
    />
  </svg>
);

export function Hero() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const primaryRaw = useCSSVar("--primary");

  const palette = useMemo(() => {
    const ch = primaryRaw ? oklchChannels(primaryRaw) : "0.50 0.30 250";
    if (isDark) {
      return {
        gradientFrom: `oklch(${ch} / 0.55)`,
        gradientTo:   `oklch(${ch} / 0.28)`,
        glowColor:    "#0e0c18",
        bg:           "bg-[#08070f]",
      };
    }
    return {
      gradientFrom: `oklch(${ch} / 0.22)`,
      gradientTo:   `oklch(${ch} / 0.10)`,
      glowColor:    "#ffffff",
      bg:           "bg-[#f4f4f8]",
    };
  }, [isDark, primaryRaw]);

  return (
    <section className={`relative overflow-hidden ${palette.bg}`}>
      <div className="absolute inset-0">
        <DotField
          dotRadius={2}
          dotSpacing={15}
          cursorRadius={400}
          bulgeStrength={50}
          glowRadius={180}
          gradientFrom={palette.gradientFrom}
          gradientTo={palette.gradientTo}
          glowColor={palette.glowColor}
        />
      </div>

      {/* Bottom fade into page background */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background to-transparent" />

      <div className="relative z-10 flex flex-col items-center px-6 pb-16 pt-20 text-center sm:pb-20 sm:pt-28">
        <div
          className={`mb-6 rounded-2xl p-3 shadow-2xl backdrop-blur-sm ${
            isDark
              ? "bg-white/10 shadow-black/20 ring-1 ring-white/10"
              : "bg-white/80 shadow-black/6 ring-1 ring-black/6"
          }`}
        >
          {isDark ? CHATGPT_ICON_DARK : CHATGPT_ICON_LIGHT}
        </div>

        <h1
          className={`mb-3 max-w-lg text-3xl font-extrabold tracking-tight sm:text-[2.75rem] sm:leading-[1.15] ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          ChatGPT Reviews
        </h1>

        <p
          className={`max-w-md text-[15px] font-medium leading-relaxed ${
            isDark ? "text-white/50" : "text-gray-400"
          }`}
        >
          Explore what users are saying about the ChatGPT iOS app. Search,
          filter, and discover trends across thousands of reviews.
        </p>
      </div>
    </section>
  );
}
