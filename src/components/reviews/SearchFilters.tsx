import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Star, Globe, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { languageName, languageFlag } from "@/lib/languages";

interface SearchFiltersProps {
  query: string;
  stars: string | undefined;
  lang: string | undefined;
  onQueryChange: (q: string) => void;
  onStarsChange: (stars: string | undefined) => void;
  onLangChange: (lang: string | undefined) => void;
}

const DEBOUNCE_MS = 400;

const RATINGS = [5, 4, 3, 2, 1] as const;

const LANGUAGE_OPTIONS = [
  { value: "all", code: undefined },
  { value: "en", code: "en" },
  { value: "es", code: "es" },
  { value: "fr", code: "fr" },
  { value: "de", code: "de" },
  { value: "pt", code: "pt" },
  { value: "ja", code: "ja" },
  { value: "ko", code: "ko" },
  { value: "zh", code: "zh" },
  { value: "ru", code: "ru" },
  { value: "ar", code: "ar" },
  { value: "it", code: "it" },
  { value: "nl", code: "nl" },
  { value: "tr", code: "tr" },
  { value: "hi", code: "hi" },
  { value: "th", code: "th" },
  { value: "vi", code: "vi" },
] as const;

function MiniStars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-px">
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} className="size-3 fill-current" />
      ))}
    </span>
  );
}

function LangLabel({ code }: { code: string | undefined }) {
  if (!code) return <span>All Languages</span>;
  return (
    <span className="flex items-center gap-1.5">
      <span>{languageFlag(code)}</span>
      <span>{languageName(code)}</span>
    </span>
  );
}

export function SearchFilters({
  query,
  stars,
  lang,
  onQueryChange,
  onStarsChange,
  onLangChange,
}: SearchFiltersProps) {
  const [localQuery, setLocalQuery] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleQueryChange = useCallback(
    (value: string) => {
      setLocalQuery(value);
      if (debounceRef.current !== undefined) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onQueryChange(value);
      }, DEBOUNCE_MS);
    },
    [onQueryChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current !== undefined) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const clearQuery = useCallback(() => {
    setLocalQuery("");
    if (debounceRef.current !== undefined) {
      clearTimeout(debounceRef.current);
    }
    onQueryChange("");
  }, [onQueryChange]);

  const activeRating = stars ?? undefined;
  const activeLangCode = LANGUAGE_OPTIONS.find((o) => o.value === (lang ?? "all"))?.code;

  return (
    <div className="space-y-4">
      {/* Top row: search + language */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search reviews…"
            value={localQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="h-11 rounded-xl border-border/70 bg-surface-elevated pl-10 pr-10 text-sm shadow-xs transition-shadow placeholder:text-muted-foreground/60 focus-visible:shadow-md focus-visible:ring-primary/30"
          />
          {localQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearQuery}
              className="absolute right-1.5 top-1/2 size-7 -translate-y-1/2 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border/70 bg-surface-elevated px-3.5 text-sm shadow-xs transition-colors outline-none",
              "hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
              "sm:w-[180px]",
              lang ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Globe className="size-3.5 shrink-0 text-muted-foreground" />
              <LangLabel code={activeLangCode} />
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="max-h-72 w-[180px] overflow-y-auto rounded-xl p-1"
          >
            <DropdownMenuRadioGroup
              value={lang ?? "all"}
              onValueChange={(val) =>
                onLangChange(!val || val === "all" ? undefined : val)
              }
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <DropdownMenuRadioItem
                  key={opt.value}
                  value={opt.value}
                  className="cursor-pointer rounded-lg px-2.5 py-2 text-sm"
                >
                  <span className="flex flex-1 items-center gap-2">
                    {opt.value === "all" ? (
                      <>
                        <Globe className="size-3.5 text-muted-foreground" />
                        <span>All Languages</span>
                      </>
                    ) : (
                      <>
                        <span className="w-5 text-center text-base leading-none">
                          {languageFlag(opt.code)}
                        </span>
                        <span>{languageName(opt.code)}</span>
                      </>
                    )}
                  </span>
                  {(lang ?? "all") === opt.value && (
                    <Check className="ml-auto size-3.5 shrink-0 text-primary" />
                  )}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rating pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Rating
        </span>

        <button
          type="button"
          onClick={() => onStarsChange(undefined)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all",
            !activeRating
              ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
              : "border-border/60 bg-surface-elevated text-muted-foreground hover:border-border hover:text-foreground"
          )}
        >
          All
        </button>

        {RATINGS.map((n) => {
          const isActive = activeRating === String(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => onStarsChange(isActive ? undefined : String(n))}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all",
                isActive
                  ? "border-star/30 bg-star/10 text-star shadow-sm"
                  : "border-border/60 bg-surface-elevated text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <MiniStars count={n} />
              <span>{n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
