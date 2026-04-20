"use client";

import React from "react";
// UNCOMMENT ALL LINES TO ACTIVATE GAME PAGE API LOGIC
// import { useApi } from "@/hooks/useApi";
// import type { ApplicationError } from "@/types/error";
import GameStreetView from "@/components/GameStreetView";
import type { LeafletMapLike } from "./GameLeafletMap";
import type { GameData, GameSession, UserGuess } from "@/types/user";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import {
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
} from "@/utils/auth";
import {
  Clock3,
  Expand,
  Flag,
  Minimize,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const MASCOT_IMAGES: Record<number, string> = {
  1: "/mascots/earth-sunglasses.svg",
  2: "/mascots/robot-flower.svg",
  3: "/mascots/saturn-space.svg",
  4: "/mascots/smiling-sun.svg",
};

const DEFAULT_SESSION: GameSession = {
  session_id: "sample-session",
  expiry_date: new Date(Date.now() + 1000 * 60 * 2 + 1000 * 17).toISOString(),
  round_number: 2,
  total_rounds: 5,
  mode: "singleplayer",
};

const DEFAULT_GAME_DATA: GameData = {
  wikidata_url:
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80",
  round_number: 2,
  latitude: 46.948,
  longitude: 7.4474,
  location_name: "Bern",
  expiry_date: DEFAULT_SESSION.expiry_date,
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

const GameLeafletMap = dynamic(() => import("./GameLeafletMap"), { ssr: false });

const GamePage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ session_id: string }>();
  // const apiService = useApi();
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [currentMascotId, setCurrentMascotId] = React.useState<number | null>(null);
  const [session, setSession] = React.useState<GameSession>(DEFAULT_SESSION);
  const [, setGameData] = React.useState<GameData>(DEFAULT_GAME_DATA);
  const [isAuthorized, setIsAuthorized] = React.useState<boolean>(false);
  const [mapExpanded, setMapExpanded] = React.useState<boolean>(false);
  const [hasSubmittedGuess, setHasSubmittedGuess] = React.useState<boolean>(false);
  const [timeLeft, setTimeLeft] = React.useState<string>(
    formatTimeLeft(DEFAULT_SESSION.expiry_date),
  );
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
  const handlePanoramaLoaded = React.useCallback((candidate: {
    latitude: number;
    longitude: number;
  }) => {
    setGameData((previousGameData) => ({
      ...previousGameData,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
    }));
  }, []);

  const loadGamePageData = React.useCallback(() => {
    const storedCurrentUserId = getStoredCurrentUserId();
    const storedCurrentMascotId = getStoredCurrentMascotId();

    setCurrentUserId(storedCurrentUserId);
    setCurrentMascotId(storedCurrentMascotId);

    // Redirect guests or broken auth state back to the landing page.
    // if (!token || !storedCurrentUserId) {
    //   router.replace("/");
    //   return;
    // }

    if (!sessionId) {
      router.replace("/");
      return;
    }

    try {
      // Check whether the logged-in user is actually part of this session.
      // Example backend direction from your DB design:
      // await apiService.get<SessionUser>(
      //   `/sessions/${sessionId}/users/${storedCurrentUserId}`,
      //   { Authorization: `Bearer ${token}` },
      // );

      // Load the session-level state such as round number and expiry date.
      // const fetchedSession = await apiService.get<GameSession>(
      //   `/sessions/${sessionId}`,
      //   { Authorization: `Bearer ${token}` },
      // );

      // Load round data from your game service. This should eventually give
      // you the Wikidata image URL plus the correct coordinates for scoring.
      // const fetchedGameData = await apiService.get<GameData>(
      //   `/games/${sessionId}/rounds/${fetchedSession.round_number}`,
      //   { Authorization: `Bearer ${token}` },
      // );

      setSession((previousSession) => ({
        ...previousSession,
        session_id: sessionId,
      }));
      setGameData((previousGameData) => ({
        ...previousGameData,
        round_number: DEFAULT_SESSION.round_number,
      }));
      setIsAuthorized(true);
    } catch (error) {
      // const appError = error as ApplicationError;

      // Use this branch later once the protected endpoints exist.
      // if (appError.status === 401 || appError.status === 403 || appError.status === 404) {
      //   router.replace("/");
      //   return;
      // }

      if (error instanceof Error) {
        alert(`Something went wrong while loading the game page:\n${error.message}`);
      } else {
        alert("Something went wrong while loading the game page.");
      }
    }
  }, [router, sessionId]);

  React.useEffect(() => {
    loadGamePageData();
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

  React.useEffect(() => {
    setTimeLeft(formatTimeLeft(session.expiry_date));

    // Poll once per second so the round timer stays in sync with the backend
    // expiry date. If your backend sends a refreshed expiry_date, update
    // `session.expiry_date` and this display will follow automatically.
    const timer = globalThis.setInterval(() => {
      setTimeLeft(formatTimeLeft(session.expiry_date));

      // Once the timer hits zero, the frontend can ask the backend whether the
      // round is finished and whether it should redirect to the result page.
      // if (new Date(session.expiry_date).getTime() <= Date.now()) {
      //   await apiService.get(`/games/${session.session_id}/rounds/${session.round_number}/status`);
      // }
    }, 1000);

    return () => globalThis.clearInterval(timer);
  }, [session.expiry_date]);

  React.useEffect(() => {
    if (leafletMapRef.current) {
      // Allow CSS transition/layout to settle before recomputing map size.
      globalThis.setTimeout(() => leafletMapRef.current?.invalidateSize(), 200);
    }
  }, [mapExpanded]);

  const worldBounds = React.useMemo<[[number, number], [number, number]]>(
    () => [[-60, -180], [85, 180]],
    [],
  );

  const handleSubmitGuess = () => {
    if (!selectedGuess || !currentUserId) {
      return;
    }

    const guessPayload: UserGuess = {
      user_id: currentUserId,
      session_id: session.session_id,
      round_number: session.round_number,
      latitude: selectedGuess.latitude,
      longitude: selectedGuess.longitude,
    };

    try {
      setHasSubmittedGuess(true);

      // Submit the guess once your backend route exists.
      // await apiService.post<void>(
      //   `/games/${session.session_id}/guess`,
      //   guessPayload,
      //   { Authorization: `Bearer ${getStoredToken()}` },
      // );

      // In singleplayer the backend can respond with the next redirect target
      // immediately after scoring the guess.
      // if (session.mode === "singleplayer") {
      //   router.push(`/result/${session.session_id}`);
      //   return;
      // }

      // In multiplayer keep the user on this page after submission and wait for
      // the expiry_date loop above to detect the round transition.
      // if (session.mode === "multiplayer") {
      //   await apiService.get(`/games/${session.session_id}/rounds/${session.round_number}/status`);
      // }
    } catch (error) {
      setHasSubmittedGuess(false);

      if (error instanceof Error) {
        alert(`Something went wrong while submitting the guess:\n${error.message}`);
      } else {
        alert("Something went wrong while submitting the guess.");
      }
    }

    void guessPayload;
  };

  if (!isAuthorized) {
    return null;
  }

  const roundLabel = `${session.round_number}/${Math.min(session.total_rounds, 3)}`;

  return (
    <div className="game-page-shell">
      <div className="game-page-background" />

      <nav className="login-page-nav game-page-nav">
        <div className="login-page-nav-left">
          <Link href="/" className="login-page-brand">
            <div className="login-page-brand-icon" aria-hidden="true">
              G
            </div>
            <span className="login-page-brand-text">GeoGuess</span>
          </Link>
        </div>

        <div className="game-page-nav-center">
          <div className="game-page-status-pill">
            <Clock3 className="game-page-status-icon" />
            <span>Round Timer</span>
            <strong>{timeLeft}</strong>
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
          <GameStreetView onPanoramaLoaded={handlePanoramaLoaded} />
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
              <div className="game-map-header">
                <div>
                  <p className="game-map-header-eyebrow">Guess Map</p>
                  <h2 className="game-map-header-title">OpenStreetMap</h2>
                </div>
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
              </div>

              <div className="game-map-body">
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
                  onClick={handleSubmitGuess}
                  disabled={!selectedGuess || hasSubmittedGuess}
                >
                  <Flag className="game-submit-button-icon" />
                  <span>
                    {hasSubmittedGuess && session.mode === "multiplayer"
                      ? "Guess Submitted"
                      : "Submit Guess"}
                  </span>
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
