const AUTH_TOKEN_STORAGE_KEY = "token";

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
  return null;
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  globalThis.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}
