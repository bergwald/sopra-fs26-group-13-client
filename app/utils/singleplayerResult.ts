"use client";

import type { GameRoundResult } from "@/types/user";

const SINGLEPLAYER_RESULT_STORAGE_PREFIX = "singleplayer-round-result";

export function getSinglePlayerResultStorageKey(
  sessionId: string,
  roundNumber: number,
): string {
  return `${SINGLEPLAYER_RESULT_STORAGE_PREFIX}:${sessionId}:${roundNumber}`;
}

export function storeSinglePlayerRoundResult(
  sessionId: string,
  result: GameRoundResult,
): void {
  if (typeof window === "undefined") {
    return;
  }

  globalThis.sessionStorage.setItem(
    getSinglePlayerResultStorageKey(sessionId, result.round_number),
    JSON.stringify(result),
  );
}

export function readSinglePlayerRoundResult(
  sessionId: string,
  roundNumber: number,
): GameRoundResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = globalThis.sessionStorage.getItem(
    getSinglePlayerResultStorageKey(sessionId, roundNumber),
  );

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as GameRoundResult;

    if (
      typeof parsedValue !== "object" || parsedValue === null ||
      parsedValue.round_number !== roundNumber
    ) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}
