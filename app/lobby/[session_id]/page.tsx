"use client";

import { useApi } from "@/hooks/useApi";
import type { BackendSessionUserDetails, User } from "@/types/user";
import {
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import {
  Check,
  Copy,
  LogOut,
  Play,
  ShipWheel,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const DEFAULT_POLL_INTERVAL_MS = 2000;
const MAX_BACKOFF_MS = 30000;
const DEFAULT_PLAYER_SLOTS = 4;

const MASCOT_IMAGES: Record<number, string> = {
  1: "/mascots/earth-sunglasses.svg",
  2: "/mascots/robot-flower.svg",
  3: "/mascots/saturn-space.svg",
  4: "/mascots/smiling-sun.svg",
};

type LobbyUser = BackendSessionUserDetails & {
  username?: string;
  mascotId: number;
};
const buildAuthorizedHeaders = (token: string, userId: number): HeadersInit => {
  return {
    Authorization: `Bearer ${token}`,
    userId: String(userId),
  };
};

const LobbyPage: React.FC = () => {
  const params = useParams<{ session_id: string }>();
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;
  const router = useRouter();
  const api = useApi();

  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [currentMascotId, setCurrentMascotId] = React.useState<number | null>(null);
  const [sessionUsers, setSessionUsers] = React.useState<BackendSessionUserDetails[]>([]);
  const [userDetailsById, setUserDetailsById] = React.useState<Record<number, User>>({});
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);
  const userLookupInFlightRef = React.useRef<Set<number>>(new Set());
  const userDetailsByIdRef = React.useRef<Record<number, User>>({});

  React.useEffect(() => {
    userDetailsByIdRef.current = userDetailsById;
  }, [userDetailsById]);

  React.useEffect(() => {
    if (!sessionId) {
      router.replace("/");
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let backoffMs = DEFAULT_POLL_INTERVAL_MS;

    const scheduleNextFetch = (delayMs: number) => {
      timeoutId = setTimeout(() => {
        void fetchSessionData();
      }, delayMs);
    };

    const fetchMissingUserDetails = async (
      users: BackendSessionUserDetails[],
      token: string,
    ) => {
      const missingIds = users
        .map((user) => user.id)
        .filter((id) => !userDetailsByIdRef.current[id] && !userLookupInFlightRef.current.has(id));

      if (missingIds.length === 0) {
        return;
      }

      missingIds.forEach((id) => userLookupInFlightRef.current.add(id));

      const resolvedUsers = await Promise.all(
        missingIds.map(async (id) => {
          try {
            const user = await api.get<User>(`/users/${id}`, {
              Authorization: `Bearer ${token}`,
            });
            return { id, user };
          } catch {
            return {
              id,
              user: {
                id,
                username: `User ${id}`,
                bio: "",
                creationDate: "",
              },
            };
          }
        }),
      );

      if (cancelled) {
        return;
      }

      setUserDetailsById((currentState) => {
        const nextState = { ...currentState };
        resolvedUsers.forEach(({ id, user }) => {
          nextState[id] = user;
          userLookupInFlightRef.current.delete(id);
        });
        return nextState;
      });
    };

    const fetchSessionData = async () => {
      try {
        const token = getStoredToken();
        const storedCurrentUserId = getStoredCurrentUserId();
        const storedCurrentMascotId = getStoredCurrentMascotId();

        if (!token || !storedCurrentUserId) {
          router.replace("/");
          return;
        }

        setCurrentUserId(storedCurrentUserId);
        setCurrentMascotId(storedCurrentMascotId);

        const headers = buildAuthorizedHeaders(token, storedCurrentUserId);
        const response = await api.get<BackendSessionUserDetails[]>(
          `/session/${sessionId}`,
          headers,
        );
        const owner = response.find((user) => user.userRole === "OWNER");
        if (owner && owner.roundNumber > 0) {
          router.push(`/game/${sessionId}`);
          return;
        }

        if (cancelled) {
          return;
        }

        setSessionUsers(response);
        setError(null);
        setLoading(false);
        backoffMs = DEFAULT_POLL_INTERVAL_MS;
        void fetchMissingUserDetails(response, token);
        scheduleNextFetch(DEFAULT_POLL_INTERVAL_MS);
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        console.error("Failed to fetch session data:", fetchError);
        setError("Failed to fetch session data. Retrying...");
        setLoading(false);
        backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
        scheduleNextFetch(backoffMs);
      }
    };

    void fetchSessionData();

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [api, router, sessionId]);

  const handleCopy = async () => {
    if (!sessionId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.error("Failed to copy session ID:", copyError);
    }
  };

  const handleStartGame = async () => {
    try {
      const token = getStoredToken();
      const storedCurrentUserId = getStoredCurrentUserId();

      if (!token || !storedCurrentUserId || !sessionId) {
        router.replace("/");
        return;
      }

      const headers = buildAuthorizedHeaders(token, storedCurrentUserId);
      await api.put(
        `/session/${sessionId}/increaseRoundNumber?currentRoundNumber=0`,
        {},
        headers,
      );
      router.push(`/game/${sessionId}`);
    } catch (startError) {
      console.error("Failed to start game:", startError);
      setError("Failed to start the game. Please try again.");
    }
  };

  if (loading) {
    return <div className="login-container">Loading lobby...</div>;
  }

  if (error && sessionUsers.length === 0) {
    return <div className="login-container">{error}</div>;
  }

  const navMascotImage = MASCOT_IMAGES[currentMascotId ?? 1] ?? MASCOT_IMAGES[1];
  const sessionExpiryDateTime = sessionUsers[0]?.sessionExpiryDateTime;
  const displaySessionId = sessionId && sessionId.length > 8
    ? `${sessionId.slice(0, 8)}...`
    : sessionId;

  const lobbyUsers: LobbyUser[] = sessionUsers.map((user) => {
    const fetchedUser = userDetailsById[user.id];
    return {
      ...user,
      username: fetchedUser?.username ?? `User ${user.id}`,
      mascotId: 1,
      // mascotId: fetchedUser?.mascot_id ?? 1,
    };
  });

  const lobbySlots = Array.from({ length: DEFAULT_PLAYER_SLOTS }, (_, index) => {
    return lobbyUsers[index] ?? null;
  });

  const currentUser = lobbyUsers.find((user) => user.id === currentUserId);
  const isOwner = currentUser?.userRole === "OWNER";

  return (
    <div className="lobby-page-root">
      <div className="login-page-background" />
      <div className="lobby-page-sky" />
      <div className="lobby-page-sun" />
      <div className="lobby-wave lobby-wave-back" />
      <div className="lobby-wave lobby-wave-mid" />
      <div className="lobby-wave lobby-wave-front" />

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

      <main className="lobby-page-shell">
        <section className="lobby-session-banner">
          <p className="lobby-session-label">Session ID</p>
          <div className="lobby-session-code-row">
            <span className="lobby-session-code">{displaySessionId}</span>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="lobby-copy-button"
              aria-label="Copy session ID"
            >
              {copied ? <Check className="lobby-copy-icon" /> : <Copy className="lobby-copy-icon" />}
            </button>
          </div>
          <p className="lobby-session-help">
            Share this code with friends to join the expedition.
          </p>
          <div className="lobby-session-meta">
            <span>
              <strong>Crew:</strong> {lobbyUsers.length}/{DEFAULT_PLAYER_SLOTS}
            </span>
            <span>
              <strong>Expires:</strong>{" "}
              {sessionExpiryDateTime
                ? new Date(sessionExpiryDateTime).toLocaleString()
                : "Unavailable"}
            </span>
          </div>
        </section>

        <section className="lobby-ship-card" aria-label="Players in lobby">
          <div className="lobby-ship-mast" />
          <div className="lobby-ship-sail" />

          <div className="lobby-ship-content">
            <h1 className="lobby-ship-title">
              <Users className="lobby-ship-title-icon" />
              Expedition Crew
            </h1>

            <div className="lobby-player-grid">
              {lobbySlots.map((player, index) => {
                const mascotImage = player
                  ? MASCOT_IMAGES[player.mascotId] ?? MASCOT_IMAGES[1]
                  : null;
                // const mascotImage = player
                //   ? MASCOT_IMAGES[player.mascotId] ?? MASCOT_IMAGES[1]
                //   : null;

                return (
                  <div key={`${player?.id ?? "empty"}-${index}`} className="lobby-player-slot">
                    <div className={`lobby-player-avatar ${player ? "lobby-player-avatar-filled" : ""}`}>
                      {player && mascotImage ? (
                        <img
                          src={mascotImage}
                          alt={`${player.username} mascot`}
                          className="lobby-player-avatar-image"
                        />
                      ) : (
                        <span className="lobby-player-empty">+</span>
                      )}
                    </div>
                    {player ? (
                      <div className="lobby-player-meta">
                        <span className="lobby-player-name">{player.username}</span>
                        {player.userRole === "OWNER" ? (
                          <span className="lobby-player-role">Host</span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="lobby-player-meta" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="lobby-log-card" aria-label="Lobby log">
          <h2 className="lobby-log-title">Lobby Log</h2>
          <ul className="lobby-log-list">
            {lobbyUsers.map((user) => (
              <li key={user.id} className="lobby-log-item">
                <span className="lobby-log-dot" />
                <span>{user.username} has boarded the ship!</span>
              </li>
            ))}
            {lobbyUsers.length < DEFAULT_PLAYER_SLOTS ? (
              <li className="lobby-log-waiting">Waiting for more explorers...</li>
            ) : null}
          </ul>
          {error ? <p className="lobby-log-error">{error}</p> : null}
        </section>
      </main>

      <div className="lobby-action-bar">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="lobby-leave-button"
        >
          <LogOut className="lobby-action-icon" />
          <span>Leave Lobby</span>
        </button>

        <button
          type="button"
          onClick={() => void handleStartGame()}
          className="lobby-start-button"
          disabled={!isOwner}
        >
          {isOwner ? <Play className="lobby-action-icon" /> : <ShipWheel className="lobby-action-icon" />}
          <span>{isOwner ? "Start Game" : "Waiting for host"}</span>
        </button>
      </div>

      <footer className="login-page-footer profile-page-footer">
        <div className="login-page-footer-content">
          <div className="login-page-footer-text">&copy; 2026 SoPra Group 13</div>
        </div>
      </footer>
    </div>
  );
};

export default LobbyPage;
