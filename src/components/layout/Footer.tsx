export function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-border/40">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} ItayReview. All rights reserved.
        </p>

        <a
          href="https://itaycode.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          <span>Created by</span>
          <span className="font-semibold text-primary/80 underline-offset-2 group-hover:text-primary group-hover:underline transition-colors">
            itaycode.com
          </span>
          <svg
            viewBox="0 0 24 24"
            className="size-3 opacity-50 group-hover:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </footer>
  );
}
