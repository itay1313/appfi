import { useEffect, useState } from "react";

const THRESHOLD = 800;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.scrollY > THRESHOLD);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > THRESHOLD);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 flex size-10 items-center justify-center rounded-full border border-border/60 bg-card/90 text-muted-foreground shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-card hover:text-foreground hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="size-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 12V4M4 7l4-4 4 4" />
      </svg>
    </button>
  );
}
