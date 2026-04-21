"use client";

import React from "react";
import { useApi } from "@/hooks/useApi";
import type { ApplicationError } from "@/types/error";
import type { BackendSessionUserDetails, GameRoundResult } from "@/types/user";
import {
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import { readSinglePlayerRoundResult } from "@/utils/singleplayerResult";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const TOTAL_ROUNDS = 3;

const buildAuthorizedHeaders = (token: string, userId: number): HeadersInit => {
  return {
    Authorization: `Bearer ${token}`,
    userId: String(userId),
  };
};

const ResultPage: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const params = useParams<{ session_id: string }>();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [sessionUser, setSessionUser] = React.useState<BackendSessionUserDetails | null>(null);
  const [roundResult, setRoundResult] = React.useState<GameRoundResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;
  const roundParamValue = searchParams.get("round");
  const roundParam = roundParamValue ? Number(roundParamValue) : null;

  React.useEffect(() => {
    const loadResultPageData = async () => {
      const token = getStoredToken();
      const storedCurrentUserId = getStoredCurrentUserId();

      setCurrentUserId(storedCurrentUserId);
      setIsLoading(true);
      setErrorMessage("");

      if (!token || !storedCurrentUserId) {
        router.replace("/login");
        return;
      }

      if (!sessionId) {
        router.replace("/");
        return;
      }

      try {
        const headers = buildAuthorizedHeaders(token, storedCurrentUserId);
        const sessionUsers = await apiService.get<BackendSessionUserDetails[]>(
          `/session/${sessionId}`,
          headers,
        );
        const currentSessionUser = sessionUsers.find((entry) => {
          return entry.id === storedCurrentUserId;
        });

        if (!currentSessionUser) {
          router.replace("/");
          return;
        }

        const resolvedRoundNumber = roundParam && roundParam >= 1 && roundParam <= TOTAL_ROUNDS
          ? roundParam
          : Math.min(Math.max(currentSessionUser.roundNumber - 1, 1), TOTAL_ROUNDS);

        setSessionUser(currentSessionUser);
        setRoundResult(readSinglePlayerRoundResult(sessionId, resolvedRoundNumber));
      } catch (error) {
        const appError = error as ApplicationError;

        if (appError.status === 401 || appError.status === 403) {
          router.replace("/login");
          return;
        }

        if (appError.status === 404) {
          router.replace("/");
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the result page.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadResultPageData();
  }, [apiService, roundParam, router, sessionId]);

  if (isLoading) {
    return <div className="login-container">Loading round result...</div>;
  }

  if (!sessionUser) {
    return <div className="login-container">{errorMessage || "Result unavailable."}</div>;
  }

  const isFinished = sessionUser.roundNumber > TOTAL_ROUNDS;
  const completedRoundNumber = roundResult?.round_number
    ?? Math.min(Math.max(sessionUser.roundNumber - 1, 1), TOTAL_ROUNDS);
  const displayScoreOverall = roundResult?.scoreOverall ?? sessionUser.score;

  return (
    <div className="login-page-shell">
      <div className="login-page-background" />

      <nav className="login-page-nav">
        <div className="login-page-nav-left">
          <Link href="/" className="login-page-brand">
            <div className="login-page-brand-icon" aria-hidden="true">
              G
            </div>
            <span className="login-page-brand-text">GeoGuess</span>
          </Link>
        </div>

        <div className="login-page-nav-right">
          <Link
            href={currentUserId ? `/users/${currentUserId}` : "/"}
            className="login-page-close-button"
            aria-label="Open your profile"
          >
            Profile
          </Link>
        </div>
        <div className="login-page-nav-divider" />
      </nav>

      <main className="login-page-main">
        <div className="login-card">
          <div className="login-card-glow login-card-glow-top" />
          <div className="login-card-glow login-card-glow-bottom" />

          <div className="login-card-content">
            <p className="login-subtitle">
              {isFinished ? "Single-player run completed" : "Round submitted"}
            </p>
            <h2 className="login-title">
              {isFinished ? "Final Results" : `Round ${completedRoundNumber} Results`}
            </h2>

            <div className="game-top-bar" aria-label="Round result summary">
              <div className="game-metric-card">
                <span className="game-metric-label">Distance</span>
                <strong className="game-metric-value">
                  {roundResult ? `${roundResult.distance.toFixed(2)} km` : "Unavailable"}
                </strong>
              </div>
              <div className="game-metric-card">
                <span className="game-metric-label">Round Score</span>
                <strong className="game-metric-value">
                  {roundResult ? roundResult.scoreRound : "Unavailable"}
                </strong>
              </div>
              <div className="game-metric-card">
                <span className="game-metric-label">Total Score</span>
                <strong className="game-metric-value">{displayScoreOverall}</strong>
              </div>
            </div>

            <p className="login-subtitle">
              {isFinished
                ? "All three rounds are complete. You can return to the homepage or review your profile."
                : "Continue to the next round when you are ready."}
            </p>

            <button
              type="button"
              className="login-submit-button"
              onClick={() => {
                if (isFinished) {
                  router.push("/");
                  return;
                }

                router.push(`/game/${sessionId}`);
              }}
            >
              <span>{isFinished ? "Back to Home" : "Next Round"}</span>
              <span className="login-submit-arrow" aria-hidden="true">→</span>
            </button>

            {errorMessage ? (
              <p className="login-register-text">{errorMessage}</p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
