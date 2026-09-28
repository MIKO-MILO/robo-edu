import type { ApiErrorCode, ApiErrorDetail } from "./common";

/**
 * Options untuk API Client request.
 */
export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
  params?: Record<string, any>;
  idempotencyKey?: string;
  traceId?: string;
  skipAuthRedirect?: boolean;
}

/**
 * Custom Base Error class untuk semua error HTTP/API.
 */
export class ApiErrorResponse extends Error {
  public readonly statusCode: number;
  public readonly code: ApiErrorCode | string;
  public readonly traceId?: string;
  public readonly details?: ApiErrorDetail[];

  constructor(
    statusCode: number,
    code: ApiErrorCode | string,
    message: string,
    traceId?: string,
    details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = "ApiErrorResponse";
    this.statusCode = statusCode;
    this.code = code;
    this.traceId = traceId;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error khusus 422 Validation Error dengan map fieldErrors: Record<fieldName, message>
 */
export class ApiValidationError extends ApiErrorResponse {
  public readonly fieldErrors: Record<string, string>;

  constructor(
    message: string,
    details: ApiErrorDetail[] = [],
    traceId?: string
  ) {
    super(422, "VALIDATION_ERROR", message, traceId, details);
    this.name = "ApiValidationError";

    const fieldMap: Record<string, string> = {};
    for (const detail of details) {
      if (detail.field) {
        fieldMap[detail.field] = detail.message;
      }
    }
    this.fieldErrors = fieldMap;
  }
}

/**
 * Error khusus 403 Forbidden ("tidak punya akses")
 */
export class ApiForbiddenError extends ApiErrorResponse {
  constructor(
    message: string = "Anda tidak memiliki akses ke fitur atau halaman ini.",
    traceId?: string
  ) {
    super(403, "FORBIDDEN", message, traceId);
    this.name = "ApiForbiddenError";
  }
}

/**
 * Error khusus 429 Rate Limited ("terlalu banyak request")
 */
export class ApiRateLimitError extends ApiErrorResponse {
  public readonly retryAfterSeconds: number;

  constructor(
    message: string = "Terlalu banyak request, silakan coba beberapa saat lagi.",
    retryAfterSeconds: number = 60,
    traceId?: string
  ) {
    super(429, "RATE_LIMITED", message, traceId);
    this.name = "ApiRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
