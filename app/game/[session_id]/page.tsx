"use client";

import React from "react";
import { useApi } from "@/hooks/useApi";
import type { ApplicationError } from "@/types/error";
import GameStreetView from "@/components/GameStreetView";
import type { LeafletMapLike } from "./GameLeafletMap";
import type {
  BackendGameData,
  BackendSessionUserDetails,
  GameData,
  GameRoundResult,
  GameSession,
  UserGuess,
} from "@/types/user";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import {
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import { storeSinglePlayerRoundResult } from "@/utils/singleplayerResult";
import {
  Clock3,
  Expand,
  Flag,
  Minimize,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const TOTAL_ROUNDS = 3;
const ROUND_LENGTH_SECONDS = 20_000;

const MASCOT_IMAGES: Record<number, string> = {
  1: "/mascots/earth-sunglasses.svg",
  2: "/mascots/robot-flower.svg",
  3: "/mascots/saturn-space.svg",
  4: "/mascots/smiling-sun.svg",
};

const DEFAULT_SESSION: GameSession = {
  session_id: "sample-session",
  expiry_date: new Date(Date.now() + 1000 * 60 * 2 + 1000 * 17).toISOString(),
  round_started: new Date(Date.now() + 1000 * 60 * 2 + 1000 * 17).toISOString(),
  round_number: 1,
  total_rounds: TOTAL_ROUNDS,
  mode: "singleplayer",
};

const DEFAULT_GAME_DATA: GameData = {
  panorama_id: "",
  round_number: 1,
  latitude: 0,
  longitude: 0,
  expiry_date: DEFAULT_SESSION.expiry_date,
  // wikidata_url: "",
  // location_name: "",
};

const formatTimeLeft = (expiryDate: string): string => {
  const millisecondsLeft = new Date(expiryDate).getTime() - Date.now();

  if (millisecondsLeft <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(millisecondsLeft / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const buildAuthorizedHeaders = (token: string, userId: number): HeadersInit => {
  return {
    Authorization: `Bearer ${token}`,
    userId: String(userId),
  };
};


const mapSessionDetailsToGameSession = (
  sessionUser: BackendSessionUserDetails,
): GameSession => {
  return {
    session_id: sessionUser.sessionId,
    expiry_date: sessionUser.sessionExpiryDateTime,
    round_number: sessionUser.roundNumber === 0 ? 1 : sessionUser.roundNumber,
    round_started: sessionUser.roundStartedDateTime,
    total_rounds: TOTAL_ROUNDS,
    mode: "singleplayer",
  };
};

const mapBackendGameDataToGameData = (
  backendGameData: BackendGameData,
  session: GameSession,
): GameData => {
  return {
    panorama_id: backendGameData.imageUrl,
    round_number: backendGameData.roundNumber,
    latitude: DEFAULT_GAME_DATA.latitude,
    longitude: DEFAULT_GAME_DATA.longitude,
    expiry_date: session.expiry_date,
    // wikidata_url: backendGameData.imageUrl,
    // location_name: "",
  };
};

const GameLeafletMap = dynamic(() => import("./GameLeafletMap"), { ssr: false });


const GamePage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ session_id: string }>();
  const apiService = useApi();
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [currentMascotId, setCurrentMascotId] = React.useState<number | null>(null);
  const [session, setSession] = React.useState<GameSession>(DEFAULT_SESSION);
  const [gameData, setGameData] = React.useState<GameData>(DEFAULT_GAME_DATA);
  const [isAuthorized, setIsAuthorized] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [mapExpanded, setMapExpanded] = React.useState<boolean>(false);
  const [hasSubmittedGuess, setHasSubmittedGuess] = React.useState<boolean>(false);
  const [timeLeft, setTimeLeft] = React.useState<string>(
    formatTimeLeft(DEFAULT_SESSION.expiry_date),
  );
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [selectedGuess, setSelectedGuess] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const leafletMapRef = React.useRef<LeafletMapLike | null>(null);

  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;
  const navProfileImage = currentMascotId
    ? MASCOT_IMAGES[currentMascotId] ?? MASCOT_IMAGES[1]
    : null;


  const loadGamePageData = React.useCallback(async () => {
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
      const currentSessionUser = sessionUsers.find((sessionUser) => {
        return sessionUser.id === storedCurrentUserId;
      });

      if (!currentSessionUser) {
        router.replace("/");
        return;
      }

      if (currentSessionUser.roundNumber > TOTAL_ROUNDS) {
        router.replace(`/result/${sessionId}?round=${TOTAL_ROUNDS}`);
        return;
      }

      const mappedSession = mapSessionDetailsToGameSession(currentSessionUser);
      const backendGameData = await apiService.get<BackendGameData>(
        `/game_data?sessionId=${encodeURIComponent(sessionId)}&roundNumber=${currentSessionUser.roundNumber}`,
        headers,
      );
      console.log("Mapped session: ", mappedSession);
      setSession(mappedSession);
      setGameData(mapBackendGameDataToGameData(backendGameData, mappedSession));
      setSelectedGuess(null);
      setHasSubmittedGuess(false);
      setIsAuthorized(true);
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
          : "Something went wrong while loading the game page.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiService, router, sessionId]);

  React.useEffect(() => {
    void loadGamePageData();
  }, [loadGamePageData]);

  React.useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);
  const [roundTimeLeft, setRoundTimeLeft] = React.useState<string>(
    formatTimeLeft(new Date(new Date(session.round_started!).getTime() + ROUND_LENGTH_SECONDS).toISOString())
  );

  React.useEffect(() => {
    if (!session.round_started) return;

    const roundExpiryDate = new Date(session.round_started).getTime() + ROUND_LENGTH_SECONDS;
    const timer = globalThis.setInterval(() => {
      const now = Date.now();
      const millisecondsLeft = roundExpiryDate - now;

      if (millisecondsLeft <= 0) {
        console.log("Timeout reached!");
        setRoundTimeLeft("00:00");
        globalThis.clearInterval(timer);
        void handleSubmitGuess();
        //router.push(`/result/${session.session_id}?round=${session.round_number}`);
      } else {
        setRoundTimeLeft(formatTimeLeft(new Date(roundExpiryDate).toISOString()));
      }
    }, 1000); // Update every 1 second

    return () => globalThis.clearInterval(timer);
  }, [session.round_started]);
  React.useEffect(() => {
    if (leafletMapRef.current) {
      globalThis.setTimeout(() => leafletMapRef.current?.invalidateSize(), 200);
    }
  }, [mapExpanded]);

  const worldBounds = React.useMemo<[[number, number], [number, number]]>(
    () => [[-60, -180], [85, 180]],
    [],
  );

  const handleSubmitGuess = async () => {
    const token = getStoredToken();
      console.log("We want to submit!")

    if (!currentUserId || !token) {
      return;
    }

    const guessPayload: UserGuess = {
      user_id: currentUserId,
      session_id: session.session_id,
      round_number: session.round_number,
      latitude: selectedGuess?.latitude ?? -1.0,
      longitude: selectedGuess?.longitude ?? -1.0, // Setting them to default -1.0 in case the time ran out or other issues happened.

    };
    console.log("Guess payload: ", guessPayload);
    try {
      setHasSubmittedGuess(true);

      const roundResultResponse = await apiService.put<Omit<GameRoundResult, "round_number">>(
        "/submit_guess",
        {
          userId: guessPayload.user_id,
          sessionId: guessPayload.session_id,
          roundNumber: guessPayload.round_number,
          latitude: guessPayload.latitude,
          longitude: guessPayload.longitude,
        },
        buildAuthorizedHeaders(token, currentUserId),
      );

      const roundResult: GameRoundResult = {
        round_number: session.round_number,
        ...roundResultResponse,
      };
      console.log("Saving and moving forward");
      storeSinglePlayerRoundResult(session.session_id, roundResult);
      router.push(`/result/${session.session_id}?round=${session.round_number}`);
    } catch (error) {
      const appError = error as ApplicationError;
      setHasSubmittedGuess(false);

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
          : "Something went wrong while submitting the guess.",
      );
    }
  };

  if (isLoading || !isAuthorized) {
    return (
      <div className="login-container">
        {errorMessage || "Loading game session..."}
      </div>
    );
  }


  const roundLabel = `${session.round_number}/${session.total_rounds}`;

  return (
    <div className="game-page-shell">
      <div className="game-page-background" />

      <nav className="login-page-nav game-page-nav">
        <div className="login-page-nav-left">
          <Link href="/" className="login-page-brand">
            <div className="login-page-brand-icon" aria-hidden="true">
              G
            </div>
            <span className="login-page-brand-text">MountainGuessr</span>
          </Link>
        </div>

        <div className="game-page-nav-center">
          <div className="game-page-status-pill">
            <Clock3 className="game-page-status-icon" />
            <span>Session Timer</span>
            <strong>{timeLeft}</strong>
          </div>
          <div className="game-page-status-pill">
            <Clock3 className="game-page-status-icon" />
            <span>Round Timer</span>
            <strong>{formatTimeLeft(new Date(new Date(session.round_started!).getTime() + ROUND_LENGTH_SECONDS).toISOString())}</strong>

          </div>
        </div>

        <div className="login-page-nav-right">
          <Link
            href={currentUserId ? `/users/${currentUserId}` : "/"}
            className="profile-nav-avatar-link"
            aria-label={currentUserId ? "Open your profile" : "Go to homepage"}
          >
            {navProfileImage
              ? (
                <img
                  src={navProfileImage}
                  alt="Your mascot"
                  className="profile-nav-avatar-image"
                />
              )
              : <UserCircle className="profile-nav-avatar-icon" />}
          </Link>
        </div>
        <div className="login-page-nav-divider" />
      </nav>

      <main className="game-page-main">
        <section className="game-hero-panel">
          <GameStreetView panoramaId={gameData.panorama_id} />
          <div className="game-hero-vignette" />
          <div className="game-hero-grid" />

          <div className="game-page-overlay">
            <section className="game-top-bar" aria-label="Round overview">
              <div className="game-metric-card">
                <span className="game-metric-label">Session</span>
                <strong className="game-metric-value">{session.session_id}</strong>
              </div>
              <div className="game-metric-card">
                <span className="game-metric-label">Round</span>
                <strong className="game-metric-value">{roundLabel}</strong>
              </div>
              <div className="game-metric-card">
                <span className="game-metric-label">Mode</span>
                <strong className="game-metric-value">{session.mode}</strong>
              </div>
            </section>

            <section
              className={`game-map-panel ${mapExpanded ? "game-map-panel-expanded" : ""}`}
              aria-label="Guess map"
            >
              <div className="game-map-body">
                <button
                  type="button"
                  className="game-map-toggle"
                  onClick={() => setMapExpanded((previousValue) => !previousValue)}
                  aria-label={mapExpanded ? "Collapse map" : "Expand map"}
                >
                  {mapExpanded ? (
                    <Minimize className="game-map-toggle-icon" />
                  ) : (
                    <Expand className="game-map-toggle-icon" />
                  )}
                </button>

                <GameLeafletMap
                  worldBounds={worldBounds}
                  selectedGuess={selectedGuess}
                  onGuessSelected={setSelectedGuess}
                  onMapReady={(mapInstance) => {
                    leafletMapRef.current = mapInstance;
                  }}
                />
              </div>

              <div className="game-map-footer">
                <div className="game-guess-readout">
                  <span className="game-map-header-eyebrow">Selected Guess</span>
                  <strong className="game-guess-readout-value">
                    {selectedGuess
                      ? `${selectedGuess.latitude}, ${selectedGuess.longitude}`
                      : "No guess placed yet"}
                  </strong>
                </div>

                <button
                  type="button"
                  className="game-submit-button"
                  onClick={() => void handleSubmitGuess()}
                  disabled={!selectedGuess || hasSubmittedGuess}
                >
                  <Flag className="game-submit-button-icon" />
                  <span>{hasSubmittedGuess ? "Submitting..." : "Submit Guess"}</span>
                </button>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GamePage;
