import { useMemo } from "react";
import { DotField } from "@/components/ui/DotField";
import { useTheme } from "@/hooks/use-theme";

/** Official OpenAI / ChatGPT "bloom" logo — viewBox 0 0 24 24 */
const OPENAI_PATH =
  "M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071.008L4.236 14.19a4.504 4.504 0 0 1-1.897-6.294zm16.597 3.855l-5.843-3.372L15.115 7.2a.076.076 0 0 1 .071-.008l4.583 2.648a4.5 4.5 0 0 1-.694 8.125v-5.68a.79.79 0 0 0-.394-.634zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.583-2.647a4.5 4.5 0 0 1 6.679 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.607 1.5-2.602-1.5z";

const CHATGPT_ICON_DARK = (
  /* Dark hero → white card, black logo (matches real ChatGPT iOS icon) */
  <svg viewBox="0 0 24 24" className="size-12 sm:size-14" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="5.5" fill="white" />
    <path d={OPENAI_PATH} fill="black" transform="scale(0.82) translate(2.2, 2.2)" />
  </svg>
);

const CHATGPT_ICON_LIGHT = (
  /* Light hero → black card, white logo */
  <svg viewBox="0 0 24 24" className="size-12 sm:size-14" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="5.5" fill="black" />
    <path d={OPENAI_PATH} fill="white" transform="scale(0.82) translate(2.2, 2.2)" />
  </svg>
);

export function Hero() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Colours are hardcoded from the known flame-orange scale (hue 33) defined
  // in index.css. We can't read --primary via getComputedStyle because CSS
  // custom properties that reference other vars (var(--indigo-400)) are
  // returned unresolved, which produces an invalid canvas fillStyle string.
  const palette = useMemo(() => {
    if (isDark) {
      return {
        // indigo-400 equivalent: oklch(0.72 0.200 33) — bright flame-orange
        gradientFrom: "oklch(0.72 0.200 33 / 0.55)",
        gradientTo:   "oklch(0.72 0.200 33 / 0.28)",
        glowColor:    "#0e0c18",
        bg:           "bg-[#08070f]",
      };
    }
    return {
      // indigo-600 equivalent: oklch(0.648 0.241 33) — deep flame-orange
      gradientFrom: "oklch(0.648 0.241 33 / 0.45)",
      gradientTo:   "oklch(0.648 0.241 33 / 0.22)",
      glowColor:    "#ffffff",
      bg:           "bg-[#fffbfa]",
    };
  }, [isDark]);

  return (
    <section className={`relative overflow-hidden ${palette.bg}`}>
      {/* Dot field — rendered immediately; DotField lazily starts its own RAF
          via requestIdleCallback so it never blocks the initial paint. */}
      <div className="absolute inset-0" aria-hidden="true">
        <DotField
          dotRadius={2}
          dotSpacing={20}
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
          className={`mb-3 max-w-lg text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-tight ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          ChatGPT Reviews
        </h1>

        <p
          className={`max-w-md text-base font-medium leading-relaxed ${
            isDark ? "text-white/70" : "text-gray-500"
          }`}
        >
          Explore what users are saying about the ChatGPT iOS app. Search,
          filter, and discover trends across thousands of reviews.
        </p>
      </div>
    </section>
  );
}
