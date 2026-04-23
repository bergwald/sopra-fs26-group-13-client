"use client";

import React from "react";
import { useApi } from "@/hooks/useApi";
import type { LeafletMapLike } from "./ResultLeafletMap";
import "leaflet/dist/leaflet.css";
import type { BackendSessionUserDetails, GameRoundResult } from "@/types/user";
import {
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import dynamic from "next/dynamic";
import { readSinglePlayerRoundResult } from "@/utils/singleplayerResult";
import {
  ArrowRight,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const TOTAL_ROUNDS = 3;

const MASCOT_IMAGES: Record<number, string> = {
  1: "/mascots/earth-sunglasses.svg",
  2: "/mascots/robot-flower.svg",
  3: "/mascots/saturn-space.svg",
  4: "/mascots/smiling-sun.svg",
};
 
const buildAuthorizedHeaders = (token: string, userId: number): HeadersInit => {
  return {
    Authorization: `Bearer ${token}`,
    userId: String(userId),
  };
};

const ResultLeafletMap = dynamic(() => import("./ResultLeafletMap"), { ssr: false });

const ResultPage: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const params = useParams<{ session_id: string }>();
  const searchParams = useSearchParams();
  const leafletMapRef = React.useRef<LeafletMapLike | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [currentMascotId, setCurrentMascotId] = React.useState<number | null>(null);
  const [sessionUser, setSessionUser] = React.useState<BackendSessionUserDetails | null>(null);
  const [roundResult, setRoundResult] = React.useState<GameRoundResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [currentUserRole, setCurrentUserRole] = React.useState<string | null>(null);

  const worldBounds = React.useMemo<[[number, number], [number, number]]>(
    () => [[-60, -180], [85, 180]],
    [],
  );
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;
  const roundParamValue = searchParams.get("round");
  const roundParam = roundParamValue ? Number(roundParamValue) : null;

  
  React.useEffect(() => {
    const loadResultPageData = async () => {
      const token = getStoredToken();
      const storedCurrentUserId = getStoredCurrentUserId();
      const storedCurrentMascotId = getStoredCurrentMascotId();

      setCurrentUserId(storedCurrentUserId);
      setCurrentMascotId(storedCurrentMascotId);
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

        setCurrentUserRole(currentSessionUser.userRole);

        const resolvedRoundNumber = roundParam && roundParam >= 1 && roundParam <= TOTAL_ROUNDS
          ? roundParam
          : Math.min(Math.max(currentSessionUser.roundNumber - 1, 1), TOTAL_ROUNDS);

        setSessionUser(currentSessionUser);
        setRoundResult(readSinglePlayerRoundResult(sessionId, resolvedRoundNumber));
      } catch (error) {
                console.log("Error while showing result page ", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadResultPageData();
  }, [apiService, roundParam, router, sessionId]);

  const completedRoundNumber = roundResult?.round_number
    ?? (sessionUser ? Math.min(Math.max(sessionUser.roundNumber - 1, 1), TOTAL_ROUNDS) : 1);
  const isFinished = completedRoundNumber >= TOTAL_ROUNDS;

  React.useEffect(() => {
    const shouldPoll = !isLoading &&
      sessionUser &&
      completedRoundNumber < TOTAL_ROUNDS &&
      sessionUser.roundNumber <= TOTAL_ROUNDS &&
      currentUserRole !== "OWNER";

    if (!shouldPoll) {
      return;
    }

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const token = getStoredToken();
        const storedCurrentUserId = getStoredCurrentUserId();

        if (!token || !storedCurrentUserId || !sessionId) return;

        const headers = buildAuthorizedHeaders(token, storedCurrentUserId);
        const sessionUsers = await apiService.get<BackendSessionUserDetails[]>(
          `/session/${sessionId}`,
          headers,
        );
        const currentSessionUser = sessionUsers.find((entry) => entry.id === storedCurrentUserId);

        if (isMounted && currentSessionUser && currentSessionUser.roundNumber > (sessionUser?.roundNumber ?? 0)) {
          clearInterval(interval);
          router.push(`/game/${sessionId}`);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 1500); // polling every 1.5 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLoading, sessionUser, currentUserRole, sessionId, apiService, router, completedRoundNumber]);

  if (isLoading) {
    return <div className="login-container">Loading round result...</div>;
  }

  if (!sessionUser) {
    return <div className="login-container">{errorMessage || "Result unavailable."}</div>;
  }

  const displayScoreOverall = roundResult?.scoreOverall ?? sessionUser.score;
  const navMascotImage = MASCOT_IMAGES[currentMascotId ?? 1] ?? MASCOT_IMAGES[1];
  

  return (
    <div className="result-page-root">
      <div className="login-page-background" />
      <div className="result-page-aurora" />
      <div className="result-page-glow result-page-glow-left" />
      <div className="result-page-glow result-page-glow-right" />

      <nav className="login-page-nav profile-page-nav">
        <div className="login-page-nav-left">
          <Link href="/" className="login-page-brand">
            <div className="login-page-brand-icon" aria-hidden="true">
              G
            </div>
            <span className="login-page-brand-text">MountainGuessr</span>
          </Link>
        </div>

        <div className="login-page-nav-right">
          <Link
            href={currentUserId ? `/users/${currentUserId}` : "/login"}
            className="profile-nav-avatar-link"
            aria-label={currentUserId ? "Open your profile" : "Open login page"}
          >
            <img
              src={navMascotImage}
              alt="Profile mascot"
              className="profile-nav-avatar-image"
            />
          </Link>
        </div>
        <div className="login-page-nav-divider" />
      </nav>

      <main className="result-page-shell">
        <section className="result-hero-card">
          <div className="result-hero-top-glow" />

          <div className="result-hero-copy">
            <h1 className="result-hero-title result-hero-title-inline">
              <span className="result-trophy-inline-wrap">
                <span className="result-trophy-inline-ring" />
                <span className="result-trophy-inline-core">
                  <Trophy className="result-trophy-inline-icon" />
                </span>
              </span>
              {isFinished ? "Final Results" : `Round ${completedRoundNumber} Results`}
            </h1>
          </div>

          <div className="result-map-card">
            <div className="result-map-frame">
              <ResultLeafletMap
                worldBounds={worldBounds}
                correctCoordinates={[roundResult?.latitude ?? -88, roundResult?.longitude ?? 180]}
                onMapReady={(mapInstance) => {
                  leafletMapRef.current = mapInstance;
                }}
              />
            </div>
          </div>

          <div className="result-stat-grid" aria-label="Round result summary">
            <div className="result-stat-card result-stat-card-distance">
              <span className="result-stat-label">Distance</span>
              <div className="result-stat-row">
                <strong className="result-stat-value">
                  {roundResult ? roundResult.distance.toFixed(2) : "Unavailable"}
                </strong>
                {roundResult ? <span className="result-stat-unit">km</span> : null}
              </div>
            </div>

            <div className="result-stat-card result-stat-card-round">
              <span className="result-stat-label">Round Points</span>
              <div className="result-stat-row">
                <strong className="result-stat-value result-stat-value-round">
                  {roundResult ? `+${roundResult.scoreRound}` : "Unavailable"}
                </strong>
                {roundResult ? <span className="result-stat-unit">pts</span> : null}
              </div>
            </div>

            <div className="result-stat-card result-stat-card-total">
              <span className="result-stat-label">Total Points</span>
              <div className="result-stat-row">
                <strong className="result-stat-value result-stat-value-total">{displayScoreOverall}</strong>
                <span className="result-stat-unit">pts</span>
              </div>
            </div>
          </div>

          <p className="result-hero-description">
            {isFinished
              ? "All three rounds are complete. You can return to the homepage or review your profile."
              : "Continue to the next round when you are ready."}
          </p>

          <div className="result-action-row">
            <button
              type="button"
              className="result-next-button"
              disabled={isFinished ? false : currentUserRole !== "OWNER"}
              onClick={async () => {
                if (isFinished) {
                  router.push("/");
                  return;
                }

                try {
                  const token = getStoredToken();
                  const storedCurrentUserId = getStoredCurrentUserId();

                  if (!token || !storedCurrentUserId || !sessionId) {
                    router.replace("/login");
                    return;
                  }

                  const headers = buildAuthorizedHeaders(token, storedCurrentUserId);

                  await apiService.put(
                    `/session/${sessionId}/increaseRoundNumber?currentRoundNumber=${completedRoundNumber}`,
                    {},
                    headers,
                  );

                  router.push(`/game/${sessionId}`);
                } catch (error) {
                  console.log("Error while navigating from result page ", error);
                }
              }}
            >
              <span>{isFinished ? "Back to Home" : "Next Round"}</span>
              <ArrowRight className="result-action-icon result-action-icon-next" />
            </button>
          </div>

          {errorMessage ? (
            <p className="result-feedback-text">{errorMessage}</p>
          ) : null}
        </section>
      </main>

      <footer className="login-page-footer profile-page-footer">
        <div className="login-page-footer-content">
          <div className="login-page-footer-text">&copy; 2026 SoPra Group 13</div>
        </div>
      </footer>
    </div>
  );
};

export default ResultPage;
