import type { RequestOptions } from "@/types";
import {
  ApiErrorResponse,
  ApiValidationError,
  ApiForbiddenError,
  ApiRateLimitError,
} from "@/types";
import { buildQueryString } from "./query-builder";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.roboedu.id/api/v1";

/**
 * Interface internal untuk penanganan global auth error callback
 */
type AuthRedirectHandler = () => void;

let customAuthRedirectHandler: AuthRedirectHandler | null = null;

export function setAuthRedirectHandler(handler: AuthRedirectHandler) {
  customAuthRedirectHandler = handler;
}

function handle401Redirect() {
  if (customAuthRedirectHandler) {
    customAuthRedirectHandler();
    return;
  }
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith("/login")) {
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }
}

/**
 * Base API Client menggunakan fetch.
 * Mengikuti spesifikasi RoboEdu API (Cookie-based auth, credentials: "include", 401/403/422/429 status handling).
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    body,
    params,
    idempotencyKey,
    traceId,
    skipAuthRedirect,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const queryString = buildQueryString(params);
  const fullUrl = endpoint.startsWith("http")
    ? `${endpoint}${queryString}`
    : `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}${queryString}`;

  const headers: Record<string, string> = {
    ...((customHeaders as Record<string, string>) || {}),
  };

  // Set default Content-Type to JSON if body is not FormData
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Attach Idempotency-Key if provided
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  // Attach X-Request-ID trace_id if provided
  if (traceId) {
    headers["X-Request-ID"] = traceId;
  }

  // Format request body
  let formattedBody: BodyInit | undefined = undefined;
  if (body !== undefined && body !== null) {
    formattedBody = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    headers,
    body: formattedBody,
    // Cookies: roboedu_session HTTP-only cookie sent automatically
    credentials: fetchOptions.credentials || "include",
  });

  // Handle No Content (204)
  if (response.status === 204) {
    return {} as T;
  }

  // Parse JSON response
  let jsonResponse: any = null;
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    try {
      jsonResponse = await response.json();
    } catch {
      jsonResponse = null;
    }
  }

  // If response is OK (200-299)
  if (response.ok) {
    return jsonResponse as T;
  }

  // Extract error info from response envelope
  const errorObj = jsonResponse?.error || {};
  const errorCode = errorObj.code || "UNKNOWN_ERROR";
  const errorMessage =
    errorObj.message || jsonResponse?.message || response.statusText || "Request failed";
  const responseTraceId = errorObj.trace_id || response.headers.get("X-Request-ID") || traceId;
  const details = errorObj.details || [];

  // Status Code Specific Handling:
  // 401: Unauthorized -> Redirect to login
  if (response.status === 401) {
    if (!skipAuthRedirect) {
      handle401Redirect();
    }
    throw new ApiErrorResponse(
      401,
      errorCode || "UNAUTHORIZED",
      errorMessage,
      responseTraceId,
      details
    );
  }

  // 403: Forbidden -> Access denied ("tidak punya akses")
  if (response.status === 403) {
    throw new ApiForbiddenError(
      errorMessage || "Anda tidak memiliki akses ke fitur atau halaman ini.",
      responseTraceId
    );
  }

  // 422: Unprocessable Entity -> Form validation error
  if (response.status === 422) {
    throw new ApiValidationError(errorMessage, details, responseTraceId);
  }

  // 429: Rate Limited -> Too many requests
  if (response.status === 429) {
    let retryAfterSeconds = 60;
    const retryHeader = response.headers.get("Retry-After");
    if (retryHeader) {
      const parsed = parseInt(retryHeader, 10);
      if (!isNaN(parsed)) {
        retryAfterSeconds = parsed;
      }
    } else if (typeof jsonResponse?.retry_after === "number") {
      retryAfterSeconds = jsonResponse.retry_after;
    }

    throw new ApiRateLimitError(
      errorMessage || "Terlalu banyak request, silakan coba beberapa saat lagi.",
      retryAfterSeconds,
      responseTraceId
    );
  }

  // Generic 4xx / 5xx error
  throw new ApiErrorResponse(
    response.status,
    errorCode,
    errorMessage,
    responseTraceId,
    details
  );
}

/**
 * Shorthand helper methods untuk HTTP verbs
 */
export const http = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "POST", body });
  },

  patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "PATCH", body });
  },

  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "PUT", body });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "DELETE" });
  },
};
