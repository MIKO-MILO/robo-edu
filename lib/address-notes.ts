const STORAGE_KEY = "roboedu_address_notes";

export interface AddressNoteKeyInput {
  recipientName: string;
  phone: string;
  address: string;
  postalCode?: string | null;
}

export function buildAddressNoteKey(input: AddressNoteKeyInput): string {
  return [
    input.recipientName.trim().toLowerCase(),
    input.phone.trim().toLowerCase(),
    input.address.trim().toLowerCase(),
    (input.postalCode ?? "").trim().toLowerCase(),
  ].join("|");
}

function readNotesMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // localStorage unavailable or malformed JSON
  }
  return {};
}

export function getSavedAddressNotes(input: AddressNoteKeyInput): string {
  const map = readNotesMap();
  return map[buildAddressNoteKey(input)] ?? "";
}

export function saveAddressNotes(input: AddressNoteKeyInput, notes: string): void {
  if (typeof window === "undefined") return;
  try {
    const map = readNotesMap();
    const key = buildAddressNoteKey(input);
    const trimmed = notes.trim();
    if (trimmed) {
      map[key] = trimmed;
    } else {
      delete map[key];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage unavailable
  }
}
