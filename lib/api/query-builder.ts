import type { ListQueryParams } from "@/types";

/**
 * Utility untuk menyusun query string URL secara bersih dari objek params.
 * Menghilangkan value `undefined`, `null`, atau string kosong `""`.
 *
 * Konvensi standar:
 * - page (number)
 * - limit (number)
 * - sort (string, contoh: "-created_at")
 * - search (string)
 */
export function buildQueryString(
  params?: ListQueryParams & Record<string, any>
): string {
  if (!params || Object.keys(params).length === 0) {
    return "";
  }

  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((val) => {
        if (val !== undefined && val !== null && val !== "") {
          queryParams.append(key, String(val));
        }
      });
    } else {
      queryParams.set(key, String(value));
    }
  }

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
}
