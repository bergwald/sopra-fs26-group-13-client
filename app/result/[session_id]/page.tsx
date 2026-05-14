"use client";

import React from "react";
import { useApi } from "@/hooks/useApi";
import type { LeafletMapLike } from "./ResultLeafletMap";
import "leaflet/dist/leaflet.css";
import type { ApplicationError } from "@/types/error";
import type { BackendSessionUserDetails, GameRoundResult } from "@/types/user";
import {
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import dynamic from "next/dynamic";
import { readSinglePlayerRoundResult } from "@/utils/singleplayerResult";
import { ArrowRight, Trophy, UserCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const TOTAL_ROUNDS = 3;

const MASCOT_IMAGES: Record<number, string> = {
  1: "/mascots/earth-sunglasses.svg",
  2: "/mascots/robot-flower.svg",
  3: "/mascots/saturn-space.svg",
  4: "/mascots/smiling-sun.svg",
  5: "/mascots/cactus-sunglasses.svg",
  6: "/mascots/snowman-scarf.svg",
};
 
const buildAuthorizedHeaders = (token: string, userId: number): HeadersInit => {
  return {
    Authorization: `Bearer ${token}`,
    userId: String(userId),
  };
};

const ResultLeafletMap = dynamic(() => import("./ResultLeafletMap"), {
  ssr: false,
});

const isValidCoordinatePair = (
  latitude: number | undefined,
  longitude: number | undefined,
): boolean => {
  return latitude !== undefined &&
    longitude !== undefined &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;
};

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
  const [sessionUsers, setSessionUsers] = React.useState<BackendSessionUserDetails[]>([]);
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
  const isLoggedIn = getStoredToken() !== null && currentUserId !== null && currentMascotId !== null;
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

      if (!token || !storedCurrentUserId || !storedCurrentMascotId) {
        router.replace("/");
        return;
      }

      if (!sessionId) {
        router.replace("/");
        return;
      }

      try {
        const headers = buildAuthorizedHeaders(token, storedCurrentUserId);
        const fetchedUsers = await apiService.get<BackendSessionUserDetails[]>(
          `/session/${sessionId}`,
          headers,
        );
        
        setSessionUsers(fetchedUsers);
        
        const currentSessionUser = fetchedUsers.find(
          (entry) => entry.id === storedCurrentUserId,
        );

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
        const appError = error as ApplicationError;
        if (appError.status === 401 || appError.status === 403 || appError.status === 404) {
          router.replace("/");
          return;
        }

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
  const allGuessCoordinates = React.useMemo(() => {
    if (!sessionUsers || !roundResult) return [];
  
    return sessionUsers
      .filter((u) => u.guessSubmitted)
      .map((u) => ({
        lat: u.guessLatitude,
        lng: u.guessLongitude,
        id: u.id,
        username: u.username,
        role: u.userRole,
      }));
  }, [sessionUsers, roundResult]);

  const roundLeaderboardUsers = React.useMemo(() => {
    return [...sessionUsers]
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
  }, [sessionUsers]);

  React.useEffect(() => {
    const shouldPoll = !isLoading &&
      sessionUser &&
      completedRoundNumber < TOTAL_ROUNDS &&
      sessionUser.roundNumber <= TOTAL_ROUNDS;

    if (!shouldPoll) {
      return;
    }

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const token = getStoredToken();
        const storedCurrentUserId = getStoredCurrentUserId();
        const storedCurrentMascotId = getStoredCurrentMascotId();

        if (!token || !storedCurrentUserId || !storedCurrentMascotId || !sessionId) {
          router.replace("/");
          return;
        }

        const headers = buildAuthorizedHeaders(token, storedCurrentUserId);
        const fetchedUsers = await apiService.get<BackendSessionUserDetails[]>(
          `/session/${sessionId}`,
          headers,
        );
        
        setSessionUsers(fetchedUsers);
        
        const currentSessionUser = fetchedUsers.find(
          (entry) => entry.id === storedCurrentUserId,
        );

        if (isMounted && currentSessionUser && currentSessionUser.roundNumber > (sessionUser?.roundNumber ?? 0)) {
          clearInterval(interval);
          router.push(`/game/${sessionId}`);
        }
      } catch (error) {
        const appError = error as ApplicationError;
        if (appError.status === 401 || appError.status === 403 || appError.status === 404) {
          router.replace("/");
          return;
        }

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
  const userGuessCoordinates: [number, number] | null = roundResult &&
      roundResult.distance >= 0 &&
      isValidCoordinatePair(
        roundResult.guessLatitude,
        roundResult.guessLongitude,
      )
    ? [roundResult.guessLatitude, roundResult.guessLongitude]
    : null;
  const hasSubmittedGuess = userGuessCoordinates !== null;
  const correctCoordinates: [number, number] | null = roundResult &&
      isValidCoordinatePair(roundResult.latitude, roundResult.longitude)
    ? [roundResult.latitude, roundResult.longitude]
    : null;
  const displayDistance = roundResult && hasSubmittedGuess
    ? roundResult.distance.toFixed(2)
    : "No guess";
  const navMascotImage = currentMascotId
    ? MASCOT_IMAGES[currentMascotId] ?? MASCOT_IMAGES[1]
    : undefined;
  const allPlayersSubmitted = sessionUsers.length > 0 &&
    sessionUsers.every((user) => user.guessSubmitted);

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
              ⛰️
            </div>
            <span className="login-page-brand-text">MountainGuessr</span>
          </Link>
        </div>

        <div className="login-page-nav-right">
          <Link
            href={isLoggedIn ? `/users/${currentUserId}` : "/login"}
            className="profile-nav-avatar-link"
            aria-label={isLoggedIn ? "Open your profile" : "Open login page"}
          >
            {isLoggedIn
              ? (
                <img
                  src={navMascotImage}
                  alt="Profile mascot"
                  className="profile-nav-avatar-image"
                />
              )
              : <UserCircle className="profile-nav-avatar-icon" />}
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
              {isFinished
                ? "Final Results"
                : `Round ${completedRoundNumber} Results`}
            </h1>
          </div>

          <div className="result-map-card">
            <div className="result-map-frame">
            <ResultLeafletMap
                worldBounds={worldBounds}
                correctCoordinates={correctCoordinates}
                allGuessCoordinates={allGuessCoordinates}
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
                  {displayDistance}
                </strong>
                {roundResult && hasSubmittedGuess
                  ? <span className="result-stat-unit">km</span>
                  : null}
              </div>
            </div>

            <div className="result-stat-card result-stat-card-round">
              <span className="result-stat-label">Round Points</span>
              <div className="result-stat-row">
                <strong className="result-stat-value result-stat-value-round">
                  {roundResult ? `+${roundResult.scoreRound}` : "Unavailable"}
                </strong>
                {roundResult
                  ? <span className="result-stat-unit">pts</span>
                  : null}
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
          <div className="home-leaderboard-table-wrap result-leaderboard-wrap">
            <table className="home-leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {roundLeaderboardUsers.map((leaderboardUser, index) => {
                  const mascotImage =
                    MASCOT_IMAGES[leaderboardUser.mascotId] ??
                    MASCOT_IMAGES[1];

                  const isCurrentUser =
                    leaderboardUser.id === currentUserId;

                  return (
                    <tr
                      key={leaderboardUser.id}
                      className={
                        isCurrentUser
                          ? "home-leaderboard-row-current"
                          : undefined
                      }
                    >
                      <td>
                        <span
                          className={`home-rank-badge ${
                            index === 0
                              ? "home-rank-badge-gold"
                              : index === 1
                              ? "home-rank-badge-silver"
                              : index === 2
                              ? "home-rank-badge-bronze"
                              : ""
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </td>

                      <td>
                        <Link
                          href={`/users/${leaderboardUser.id}`}
                          className={`home-player-link ${
                            isCurrentUser
                              ? "home-player-link-current"
                              : ""
                          }`}
                        >
                          <span className="home-player-avatar">
                            <img
                              src={mascotImage}
                              alt={`${leaderboardUser.username} mascot`}
                              className="home-player-avatar-image"
                            />
                          </span>

                          <span
                            className={`home-player-name ${
                              isCurrentUser
                                ? "home-player-name-current"
                                : ""
                            }`}
                          >
                            {leaderboardUser.username}
                          </span>
                        </Link>
                      </td>
                      <td className="home-score-cell">
                        {leaderboardUser.score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
              disabled={!isFinished && (currentUserRole !== "OWNER" || !allPlayersSubmitted)}
              onClick={async () => {
                if (isFinished) {
                  router.push("/");
                  return;
                }

                try {
                  const token = getStoredToken();
                  const storedCurrentUserId = getStoredCurrentUserId();
                  const storedCurrentMascotId = getStoredCurrentMascotId();

                  if (!token || !storedCurrentUserId || !storedCurrentMascotId || !sessionId) {
                    router.replace("/");
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
                  const appError = error as ApplicationError;
                  if (appError.status === 401 || appError.status === 403 || appError.status === 404) {
                    router.replace("/");
                    return;
                  }

                  console.log("Error while navigating from result page ", error);
                }
              }}
            >
              <span>{isFinished ? "Back to Home" : "Next Round"}</span>
              <ArrowRight className="result-action-icon result-action-icon-next" />
            </button>
          </div>

          {errorMessage
            ? <p className="result-feedback-text">{errorMessage}</p>
            : null}
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
