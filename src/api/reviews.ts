import type {
  ReviewRequest,
  ReviewsResponse,
  SortOrder,
} from "@/types/review";

/**
 * Proxy URL provided by Appfigures for the take-home exercise.
 * Bypasses auth and CORS. Keep private — do not ship publicly.
 */
const BASE_URL = "https://appfigures.com/_u/careers/api/reviews";

const SORT_TO_PARAM: Record<SortOrder, string> = {
  newest: "-date",
  oldest: "date",
  helpful: "-weight",
};

/**
 * Typed error thrown when the server responds with a non-2xx status.
 * Callers can inspect `.status` to distinguish 4xx vs 5xx handling.
 */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildQuery(req: ReviewRequest): string {
  const params = new URLSearchParams();

  params.set("sort", SORT_TO_PARAM[req.sort ?? "newest"]);
  params.set("count", String(req.count ?? 25));
  params.set("page", String(req.page ?? 1));

  if (req.q?.trim()) params.set("q", req.q.trim());
  if (req.stars) params.set("stars", req.stars);
  // `lang` is intentionally omitted from the API request — the Appfigures
  // `lang` param triggers *translation*, not filtering. Language filtering
  // is done client-side via `predicted_langs`.

  return params.toString();
}

export async function fetchReviews(
  req: ReviewRequest,
  signal?: AbortSignal
): Promise<ReviewsResponse> {
  const url = `${BASE_URL}?${buildQuery(req)}`;

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // Network / DNS / CORS failures surface here.
    throw new Error("Network error. Please check your connection and try again.");
  }

  if (!response.ok) {
    throw new ApiError(
      response.status >= 500
        ? "The server is having trouble right now. Please try again in a moment."
        : `Request failed (${response.status}).`,
      response.status
    );
  }

  const body = (await response.json()) as ReviewsResponse;
  // Defensive: make sure the shape looks right. If the proxy ever changes
  // we degrade to an error the UI can render instead of crashing downstream.
  if (!body || !Array.isArray(body.reviews)) {
    throw new Error("Received an unexpected response from the server.");
  }
  return body;
}
