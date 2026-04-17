import { ExternalLink, Copy, Check, Globe } from "lucide-react";
import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { languageFlag, languageName, countryFlag } from "@/lib/languages";
import type { Review } from "@/types/review";

/* ── helpers ─────────────────────────────────────────────────── */

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function BigStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-5 transition-colors",
            i < rating ? "fill-star text-star" : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {
      // Clipboard unavailable (non-HTTPS, permission denied) — fail silently.
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? (
        <Check className="size-3.5 text-green-500" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ── Rating badge ─────────────────────────────────────────────── */
const RATING_COLORS: Record<number, string> = {
  5: "bg-green-500/10 text-green-600 dark:text-green-400",
  4: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  3: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  2: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  1: "bg-red-500/10 text-red-600 dark:text-red-400",
};

/* ── Main component ───────────────────────────────────────────── */
interface ReviewModalProps {
  review: Review;
  children: React.ReactNode;
}

export function ReviewModal({ review, children }: ReviewModalProps) {
  const stars = Math.round(Number(review.stars));
  const lang = review.predicted_langs?.[0];
  const appfiguresUrl = `https://appfigures.com/reviews/${review.vendor_id}`;
  const flag = countryFlag(review.iso);
  const langFlag = languageFlag(lang);
  const hasTranslation =
    review.original_title &&
    review.original_review &&
    review.original_title !== review.title;

  return (
    <Dialog>
      <DialogTrigger
        className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 rounded-2xl"
        render={<div />}
      >
        {children}
      </DialogTrigger>

      <DialogContent className="px-4">
        <div className="relative flex max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-border/50 bg-card shadow-2xl shadow-black/20">

          {/* ── Header ── */}
          <div className="relative px-6 pb-4 pt-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <BigStars rating={stars} />
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-bold",
                    RATING_COLORS[stars] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {stars}.0
                </span>
                <DialogCloseButton />
              </div>
            </div>

            <DialogTitle className="text-[1.35rem] leading-tight">
              {review.title || "Untitled Review"}
            </DialogTitle>

            {/* Metadata row */}
            <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/80">{review.author}</span>

              {flag && (
                <>
                  <span className="text-border">·</span>
                  <span title={review.iso?.toUpperCase()}>{flag}</span>
                </>
              )}

              {review.version && (
                <>
                  <span className="text-border">·</span>
                  <span>v{review.version}</span>
                </>
              )}

              <span className="text-border">·</span>
              <time
                dateTime={review.date}
                title={formatDate(review.date)}
                className="tabular-nums"
              >
                {timeAgo(review.date)}
              </time>

              {lang && (
                <>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1">
                    {langFlag ? (
                      <span>{langFlag}</span>
                    ) : (
                      <Globe className="size-3 text-muted-foreground/60" />
                    )}
                    <span>{languageName(lang)}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="mx-6 h-px bg-border/50" />

          {/* ── Body (scrollable) ── */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <DialogDescription className="text-[14.5px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {review.review || "No review body."}
            </DialogDescription>

            {/* Original (non-translated) */}
            {hasTranslation && (
              <details className="mt-4 rounded-xl border border-border/40 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                <summary className="cursor-pointer select-none font-semibold tracking-wide uppercase">
                  Original
                </summary>
                <p className="mt-2 leading-relaxed">{review.original_review}</p>
              </details>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="mx-6 h-px bg-border/50" />
          <div className="flex items-center justify-between gap-3 px-6 py-4">
            <CopyButton text={`${review.title}\n\n${review.review}`} />

            <a
              href={appfiguresUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              View on Appfigures
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
