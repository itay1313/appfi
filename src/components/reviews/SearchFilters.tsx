import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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

const RATING_OPTIONS = [
  { value: "all", label: "All Ratings" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "2", label: "2 Stars" },
  { value: "1", label: "1 Star" },
] as const;

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

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

      <Select
        value={stars ?? "all"}
        onValueChange={(val) =>
          onStarsChange(!val || val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-surface-elevated text-sm shadow-xs sm:w-[160px]">
          <SelectValue placeholder="All Ratings" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {RATING_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="rounded-lg"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={lang ?? "all"}
        onValueChange={(val) =>
          onLangChange(!val || val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-surface-elevated text-sm shadow-xs sm:w-[170px]">
          <SelectValue placeholder="All Languages" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {LANGUAGE_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="rounded-lg"
            >
              {opt.value === "all"
                ? "All Languages"
                : `${languageFlag(opt.code)} ${languageName(opt.code)}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
