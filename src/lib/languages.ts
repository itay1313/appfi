/**
 * Tiny ISO 639-1 → display-name lookup, plus helpers for picking the
 * primary language from a `predicted_langs` array.
 *
 * We keep this curated (not every ISO code) to avoid bundling a 200KB
 * list for a single filter dropdown. Covers the top languages the
 * ChatGPT iOS app actually gets reviews in.
 */
const NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  de: "German",
  it: "Italian",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  pl: "Polish",
  cs: "Czech",
  ro: "Romanian",
  hu: "Hungarian",
  tr: "Turkish",
  ru: "Russian",
  uk: "Ukrainian",
  ar: "Arabic",
  he: "Hebrew",
  hi: "Hindi",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
  ms: "Malay",
  fil: "Filipino",
};

/** Unicode regional-indicator flags keyed by ISO 639-1. Best-effort fallback. */
const FLAGS: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  pt: "🇵🇹",
  fr: "🇫🇷",
  de: "🇩🇪",
  it: "🇮🇹",
  nl: "🇳🇱",
  sv: "🇸🇪",
  no: "🇳🇴",
  da: "🇩🇰",
  fi: "🇫🇮",
  pl: "🇵🇱",
  cs: "🇨🇿",
  ro: "🇷🇴",
  hu: "🇭🇺",
  tr: "🇹🇷",
  ru: "🇷🇺",
  uk: "🇺🇦",
  ar: "🇸🇦",
  he: "🇮🇱",
  hi: "🇮🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
  zh: "🇨🇳",
  th: "🇹🇭",
  vi: "🇻🇳",
  id: "🇮🇩",
  ms: "🇲🇾",
  fil: "🇵🇭",
};

export function languageName(code: string | undefined | null): string {
  if (!code) return "Unknown";
  const lower = code.toLowerCase();
  return NAMES[lower] ?? lower.toUpperCase();
}

export function languageFlag(code: string | undefined | null): string {
  if (!code) return "";
  const lower = code.toLowerCase();
  return FLAGS[lower] ?? "";
}

export function primaryLanguage(
  langs: string[] | undefined | null
): string | undefined {
  if (!langs || langs.length === 0) return undefined;
  return langs[0]?.toLowerCase();
}

/**
 * Convert a two-letter country ISO code (from the review.iso field)
 * into a flag emoji. Doesn't use the language lookup — purely a flag.
 */
export function countryFlag(iso: string | undefined | null): string {
  if (!iso || iso.length !== 2) return "";
  const upper = iso.toUpperCase();
  // Combine two regional-indicator symbols.
  const codePoints = [...upper].map((c) => 127397 + c.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return "";
  }
}

/**
 * Derive the set of languages present in a review list. Used to populate
 * the language filter dropdown so we only offer options that will match.
 */
export function collectLanguages(
  reviews: { predicted_langs: string[] }[]
): string[] {
  const seen = new Set<string>();
  for (const r of reviews) {
    for (const l of r.predicted_langs ?? []) {
      if (l) seen.add(l.toLowerCase());
    }
  }
  return Array.from(seen).sort((a, b) =>
    languageName(a).localeCompare(languageName(b))
  );
}
