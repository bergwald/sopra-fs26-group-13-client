const AUTH_TOKEN_STORAGE_KEY = "token";
const AUTH_CURRENT_USER_ID_STORAGE_KEY = "currentUserId";
const AUTH_CURRENT_MASCOT_ID_STORAGE_KEY = "currentMascotId";
export const AUTH_TOKEN_CHANGED_EVENT = "auth-token-changed";

function emitAuthTokenChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  globalThis.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawToken = globalThis.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (!rawToken) {
    return null;
  }

  try {
    const parsedToken = JSON.parse(rawToken);

    if (typeof parsedToken === "string" && parsedToken.trim().length > 0) {
      return parsedToken;
    }
  } catch {
    // Fall through and clear invalid value.
  }

  globalThis.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  emitAuthTokenChanged();
  return null;
}

/**
 * Reads the logged-in user's ID from localStorage.
 * Invalid values are removed so auth state stays consistent.
 */
export function getStoredCurrentUserId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUserId = globalThis.localStorage.getItem(
    AUTH_CURRENT_USER_ID_STORAGE_KEY,
  );

  if (!rawUserId) {
    return null;
  }

  try {
    const parsedUserId = JSON.parse(rawUserId);

    if (
      typeof parsedUserId === "number" && Number.isInteger(parsedUserId) &&
      parsedUserId > 0
    ) {
      return parsedUserId;
    }
  } catch {
    // Fall through and clear invalid value.
  }

  globalThis.localStorage.removeItem(AUTH_CURRENT_USER_ID_STORAGE_KEY);
  emitAuthTokenChanged();
  return null;
}

/**
 * Reads the logged-in user's mascot ID from localStorage.
 * Invalid values are removed so auth state stays consistent.
 */
export function getStoredCurrentMascotId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawMascotId = globalThis.localStorage.getItem(
    AUTH_CURRENT_MASCOT_ID_STORAGE_KEY,
  );

  if (!rawMascotId) {
    return null;
  }

  try {
    const parsedMascotId = JSON.parse(rawMascotId);

    if (
      typeof parsedMascotId === "number" && Number.isInteger(parsedMascotId) &&
      parsedMascotId > 0
    ) {
      return parsedMascotId;
    }
  } catch {
    // Fall through and clear invalid value.
  }

  globalThis.localStorage.removeItem(AUTH_CURRENT_MASCOT_ID_STORAGE_KEY);
  emitAuthTokenChanged();
  return null;
}

/**
 * Persists the logged-in user's ID after login/registration.
 * Non-positive or non-integer values are treated as invalid and removed.
 */
export function setStoredCurrentUserId(userId: number): void {
  if (typeof window === "undefined") {
    return;
  }

  if (Number.isInteger(userId) && userId > 0) {
    globalThis.localStorage.setItem(
      AUTH_CURRENT_USER_ID_STORAGE_KEY,
      JSON.stringify(userId),
    );
    emitAuthTokenChanged();
    return;
  }

  globalThis.localStorage.removeItem(AUTH_CURRENT_USER_ID_STORAGE_KEY);
  emitAuthTokenChanged();
}

/**
 * Persists the logged-in user's mascot ID after login/registration/profile edit.
 * Non-positive or non-integer values are treated as invalid and removed.
 */
export function setStoredCurrentMascotId(mascotId: number): void {
  if (typeof window === "undefined") {
    return;
  }

  if (Number.isInteger(mascotId) && mascotId > 0) {
    globalThis.localStorage.setItem(
      AUTH_CURRENT_MASCOT_ID_STORAGE_KEY,
      JSON.stringify(mascotId),
    );
    emitAuthTokenChanged();
    return;
  }

  globalThis.localStorage.removeItem(AUTH_CURRENT_MASCOT_ID_STORAGE_KEY);
  emitAuthTokenChanged();
}

/**
 * Clears only the stored current-user ID.
 */
export function clearStoredCurrentUserId(): void {
  if (typeof window === "undefined") {
    return;
  }

  globalThis.localStorage.removeItem(AUTH_CURRENT_USER_ID_STORAGE_KEY);
  emitAuthTokenChanged();
}

/**
 * Clears only the stored current-user mascot ID.
 */
export function clearStoredCurrentMascotId(): void {
  if (typeof window === "undefined") {
    return;
  }

  globalThis.localStorage.removeItem(AUTH_CURRENT_MASCOT_ID_STORAGE_KEY);
  emitAuthTokenChanged();
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  if (token.trim().length > 0) {
    globalThis.localStorage.setItem(
      AUTH_TOKEN_STORAGE_KEY,
      JSON.stringify(token),
    );
    emitAuthTokenChanged();
    return;
  }

  globalThis.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  emitAuthTokenChanged();
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  globalThis.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  emitAuthTokenChanged();
}

/**
 * Clears token, current-user ID, and current-user mascot ID together.
 * Used when the session must be invalidated completely.
 */
export function clearStoredAuth(): void {
  if (typeof window === "undefined") {
    return;
  }

  globalThis.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  globalThis.localStorage.removeItem(AUTH_CURRENT_USER_ID_STORAGE_KEY);
  globalThis.localStorage.removeItem(AUTH_CURRENT_MASCOT_ID_STORAGE_KEY);
  emitAuthTokenChanged();
}
