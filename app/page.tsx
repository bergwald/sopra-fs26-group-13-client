"use client";

import { useApi } from "@/hooks/useApi";
import type { ApplicationError } from "@/types/error";
import type { User } from "@/types/user";
import {
  AUTH_TOKEN_CHANGED_EVENT,
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import {
  LoaderCircle,
  Play,
  Plus,
  Search,
  Trophy,
  User as UserIcon,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type LeaderboardUser = {
  id: number;
  username: string;
  score: number;
  average_distance: number;
  mascot_id: number;
};

const MASCOT_IMAGES: Record<number, string> = {
  1: "/mascots/earth-sunglasses.svg",
  2: "/mascots/robot-flower.svg",
  3: "/mascots/saturn-space.svg",
  4: "/mascots/smiling-sun.svg",
  5: "/mascots/cactus-sunglasses.svg",
  6: "/mascots/snowman-scarf.svg",
};

const mapUserToLeaderboardUser = (user: User): LeaderboardUser => ({
  id: user.id,
  username: user.username,
  score: user.score ?? 0,
  average_distance: user.avg_distance ?? 0,
  mascot_id: user.mascot_id ?? 1,
});

const sortLeaderboardUsers = (users: LeaderboardUser[]): LeaderboardUser[] => {
  return [...users]
    .sort((firstUser, secondUser) => {
      if (secondUser.score !== firstUser.score) {
        return secondUser.score - firstUser.score;
      }

      if (firstUser.average_distance !== secondUser.average_distance) {
        return firstUser.average_distance - secondUser.average_distance;
      }

      return firstUser.username.localeCompare(secondUser.username);
    })
    .slice(0, 10);
};

const formatScore = (score: number): string => {
  return new Intl.NumberFormat("en-US").format(score);
};

const formatDistance = (distance: number): string => {
  return `${distance.toFixed(1)} km`;
};

type PendingHomeAction = "singleplayer" | "create-session" | "join-session" | null;
type RegionSelectionAction = "singleplayer" | "create-session" | null;
type RegionOption = {
  id: string;
  label: string;
  image: string;
};

const REGION_OPTIONS: RegionOption[] = [
  { id: "", label: "Entire World", image: "/regions/entire-world.svg" },
  { id: "Alps", label: "Alps", image: "/regions/alps.svg" },
  { id: "NewZealandAlps", label: "New Zealand Alps", image: "/regions/new-zealand-alps.svg" },
  { id: "Himalaya", label: "Himalaya", image: "/regions/himalaya.svg" },
  { id: "JapaneseAlps", label: "Japanese Alps", image: "/regions/japanese-alps.svg" },
  { id: "Andes", label: "Andes", image: "/regions/andes.svg" },
];

const HomePage: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [currentMascotId, setCurrentMascotId] = React.useState<number | null>(null);
  const [leaderboardUsers, setLeaderboardUsers] = React.useState<LeaderboardUser[]>([]);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = React.useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = React.useState<boolean>(false);
  const [regionSelectionAction, setRegionSelectionAction] = React.useState<RegionSelectionAction>(null);
  const [selectedRegion, setSelectedRegion] = React.useState<string>("");
  const [sessionIdInput, setSessionIdInput] = React.useState<string>("");
  const [pendingHomeAction, setPendingHomeAction] = React.useState<PendingHomeAction>(null);

  React.useEffect(() => {
    const syncAuthState = () => {
      setCurrentUserId(getStoredCurrentUserId());
      setCurrentMascotId(getStoredCurrentMascotId());
    };

    syncAuthState();

    const loadLeaderboard = async () => {
      try {
        const fetchedUsers = await apiService.get<User[]>("/users");
        setLeaderboardUsers(
          sortLeaderboardUsers(fetchedUsers.map(mapUserToLeaderboardUser)),
        );
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while loading the leaderboard:\n${error.message}`);
        } else {
          alert("Something went wrong while loading the leaderboard.");
        }
      }
    };

    void loadLeaderboard();

    globalThis.addEventListener("storage", syncAuthState);
    globalThis.addEventListener(AUTH_TOKEN_CHANGED_EVENT, syncAuthState);

    return () => {
      globalThis.removeEventListener("storage", syncAuthState);
      globalThis.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, syncAuthState);
    };
  }, [apiService]);

  const navProfileImage = currentMascotId
    ? MASCOT_IMAGES[currentMascotId] ?? MASCOT_IMAGES[1]
    : undefined;
  const isLoggedIn = getStoredToken() !== null && currentUserId !== null && currentMascotId !== null;
  const isSessionActionPending = pendingHomeAction !== null;
  const pendingActionLabel = pendingHomeAction === "singleplayer"
    ? "Starting singleplayer session..."
    : pendingHomeAction === "create-session"
    ? "Creating multiplayer session..."
    : pendingHomeAction === "join-session"
    ? "Joining session..."
    : "";

  const createSession = async (action: Exclude<PendingHomeAction, "join-session" | null>) => {
    if (isSessionActionPending || !currentUserId) {
      return;
    }

    const token = getStoredToken();
    const storedCurrentMascotId = getStoredCurrentMascotId();

    if (!token || !currentUserId || !storedCurrentMascotId) {
      router.push("/login");
      return;
    }

    setPendingHomeAction(action);
    setRegionSelectionAction(null);

    try {
      const endpoint = selectedRegion
        ? `/session?region=${encodeURIComponent(selectedRegion)}`
        : "/session";
      const response = await apiService.post<{
        id: string;
        sessionExpiryDateTime: string;
        roundNumber: number;
      }>(
        endpoint,
        { userId: currentUserId },
        {
          Authorization: `Bearer ${token}`,
          userId: String(currentUserId),
        },
      );

      if (action === "singleplayer") {
        router.push(`/game/${response.id}`);
      } else {
        router.push(`/lobby/${response.id}`);
      }
    } catch (error) {
      const appError = error as ApplicationError;

      if (appError.status === 401) {
        router.push("/login");
        return;
      }

      if (appError.status === 403) {
        alert(
          action === "singleplayer"
            ? `You cannot start this singleplayer session:\n${appError.message}`
            : `You cannot create this multiplayer session:\n${appError.message}`,
        );
        return;
      }

      if (error instanceof Error) {
        alert(
          `Something went wrong while ${action === "singleplayer" ? "creating a singleplayer session" : "creating a multiplayer session"}:\n${error.message}`,
        );
      } else {
        alert(
          `Something went wrong while ${action === "singleplayer" ? "creating a singleplayer session" : "creating a multiplayer session"}.`,
        );
      }
    } finally {
      setPendingHomeAction(null);
    }
  };

  const openRegionSelection = (action: RegionSelectionAction) => {
    if (isSessionActionPending) {
      return;
    }
    const token = getStoredToken();
    const storedCurrentMascotId = getStoredCurrentMascotId();

    if (!token || !currentUserId || !storedCurrentMascotId) {
      router.push("/login");
      return;
    }

    setRegionSelectionAction(action);
  };

  const handleJoinSession = async(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSessionActionPending) {
      return;
    }

      // Example backend direction:
      // await apiService.post<void>(
      //   `/sessions/${normalizedSessionId}/join`,
      //   undefined,
      //   { Authorization: `Bearer ${getStoredToken()}` },
      // );
      //
      // If the backend accepts the join, route the player into that lobby.
      // router.push(`/lobby/${normalizedSessionId}`);

    const normalizedSessionId = sessionIdInput.trim();

    if (!normalizedSessionId) {
      return;
    }
        const token = getStoredToken();
    const storedCurrentMascotId = getStoredCurrentMascotId();

    if (!token || !currentUserId || !storedCurrentMascotId) {
      router.push("/login");
      return;
    }

    setPendingHomeAction("join-session");

    try {
      const response = await apiService.put<{
        id: string;
        sessionExpiryDateTime: string;
        roundNumber: number;
      }>(
        "/session",
        { userId: currentUserId, sessionId: normalizedSessionId},
        {
          Authorization: `Bearer ${token}`,
          userId: String(currentUserId),
        },
      );



      router.push(`/lobby/${response.id}`);
    } catch (error) {
      const appError = error as ApplicationError;

      if (appError.status === 401) {
        router.push("/login");
        return;
      }

      if (appError.status === 403) {
        alert(`You cannot join this session:\n${appError.message}`);
        return;
      }

      if (error instanceof Error) {
        alert(`Something went wrong while joining the session:\n${error.message}`);
      } else {
        alert("Something went wrong while joining the session.");
      }
    } finally {
      setPendingHomeAction(null);
    }
  };
  return (
    <div className="home-page-root" aria-busy={isSessionActionPending}>
      <div className="login-page-background" />

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
                  src={navProfileImage}
                  alt="Profile mascot"
                  className="profile-nav-avatar-image"
                />
              )
              : <UserCircle className="profile-nav-avatar-icon" />}
          </Link>
        </div>
        <div className="login-page-nav-divider" />
      </nav>

      <main className="home-page-shell">
        <section className="home-hero-card">
          <div className="home-hero-glow home-hero-glow-left" />
          <div className="home-hero-glow home-hero-glow-right" />

          <div className="home-hero-copy">
            <p className="home-hero-eyebrow">Ready To Play</p>
            <h1 className="home-hero-title">
              Altitude: +1200 meters.
              <br />
              Location: unknown.
            </h1>
            <p className="home-hero-text home-hero-question">
              Where in the mountains are you?
            </p>
            <p className="home-hero-text">
              Start a solo session, create a multiplayer lobby, or join an
              existing room with a session ID.
            </p>
          </div>

          <div className="home-play-grid">
            <button
              type="button"
              onClick={() => openRegionSelection("singleplayer")}
              className="home-play-card home-play-card-blue"
              disabled={isSessionActionPending}
            >
              <div className="home-play-icon-wrap home-play-icon-wrap-blue">
                <UserIcon className="home-play-icon" />
              </div>
              <div className="home-play-card-content">
                <h2 className="home-play-title">Singleplayer</h2>
                <p className="home-play-text">Practice alone and improve your personal score.</p>
              </div>
              <div className="home-play-arrow">
                <Play className="home-play-arrow-icon" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isSessionActionPending) {
                  return;
                }
                setIsMultiplayerOpen((previousValue) => !previousValue);
              }}
              className={`home-play-card home-play-card-indigo ${isMultiplayerOpen ? "home-play-card-active" : ""}`}
              disabled={isSessionActionPending}
            >
              <div className="home-play-icon-wrap home-play-icon-wrap-indigo">
                <Users className="home-play-icon" />
              </div>
              <div className="home-play-card-content">
                <h2 className="home-play-title">Multiplayer</h2>
                <p className="home-play-text">Create a room or join one of your friends.</p>
              </div>
            </button>

            {isMultiplayerOpen && (
              <div className="home-multiplayer-actions">
                <button
                  type="button"
                  onClick={() => openRegionSelection("create-session")}
                  className="home-multiplayer-button"
                  disabled={isSessionActionPending}
                >
                  <div className="home-multiplayer-button-icon home-multiplayer-button-icon-blue">
                    <Plus className="home-multiplayer-button-icon-svg" />
                  </div>
                  <span>Create Session</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isSessionActionPending) {
                      return;
                    }
                    setIsJoinModalOpen(true);
                  }}
                  className="home-multiplayer-button"
                  disabled={isSessionActionPending}
                >
                  <div className="home-multiplayer-button-icon home-multiplayer-button-icon-indigo">
                    <Search className="home-multiplayer-button-icon-svg" />
                  </div>
                  <span>Join Session</span>
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="home-leaderboard-card" aria-label="Global leaderboard">
          <div className="home-leaderboard-header">
            <div className="home-leaderboard-title-wrap">
              <Trophy className="home-leaderboard-trophy" />
              <div>
                <p className="home-hero-eyebrow">Top Players</p>
                <h3 className="home-leaderboard-title">Global Leaderboard</h3>
              </div>
            </div>
          </div>

          <div className="home-leaderboard-table-wrap">
            <table className="home-leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Avg. Distance</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="home-leaderboard-empty">
                      No players so far... Maybe they got lost in the mountains.
                    </td>
                  </tr>
                )}
                {leaderboardUsers.map((leaderboardUser, index) => {
                  const mascotImage = MASCOT_IMAGES[leaderboardUser.mascot_id] ?? MASCOT_IMAGES[1];
                  const isCurrentUser = isLoggedIn && leaderboardUser.id === currentUserId;

                  return (
                    <tr
                      key={leaderboardUser.id}
                      className={isCurrentUser ? "home-leaderboard-row-current" : undefined}
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
                          className={`home-player-link ${isCurrentUser ? "home-player-link-current" : ""}`}
                        >
                          <span className="home-player-avatar">
                            <img
                              src={mascotImage}
                              alt={`${leaderboardUser.username} mascot`}
                              className="home-player-avatar-image"
                            />
                          </span>
                          <span className={`home-player-name ${isCurrentUser ? "home-player-name-current" : ""}`}>
                            {leaderboardUser.username}
                          </span>
                        </Link>
                      </td>
                      <td className="home-score-cell">{formatScore(leaderboardUser.score)}</td>
                      <td className="home-distance-cell">
                        {formatDistance(leaderboardUser.average_distance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {isJoinModalOpen && (
        <div className="home-modal-backdrop" role="dialog" aria-modal="true">
          <div className="home-modal-card">
            <button
              type="button"
              onClick={() => setIsJoinModalOpen(false)}
              className="home-modal-close"
              aria-label="Close join session dialog"
              disabled={isSessionActionPending}
            >
              <X className="home-modal-close-icon" />
            </button>

            <div className="home-modal-icon-wrap">
              <Search className="home-modal-icon" />
            </div>

            <h2 className="home-modal-title">Join Session</h2>
            <p className="home-modal-text">
              Enter the session ID shared by the host to jump into the lobby.
            </p>

            <form onSubmit={handleJoinSession} className="home-modal-form">
              <input
                type="text"
                value={sessionIdInput}
                onChange={(event) => setSessionIdInput(event.target.value)}
                placeholder="e.g. A8X9-K2M1"
                className="home-modal-input"
                autoFocus
                disabled={isSessionActionPending}
              />
              <button
                type="submit"
                className="home-modal-submit"
                disabled={!sessionIdInput.trim() || isSessionActionPending}
              >
                {pendingHomeAction === "join-session" ? "Joining..." : "Join Lobby"}
              </button>
            </form>
          </div>
        </div>
      )}

      {regionSelectionAction && (
        <div className="edit-profile-modal-backdrop">
          <div className="edit-profile-modal home-region-modal" role="dialog" aria-modal="true">
            <button
              type="button"
              onClick={() => setRegionSelectionAction(null)}
              className="edit-profile-modal-close"
              aria-label="Close region selection"
              disabled={isSessionActionPending}
            >
              <X className="edit-profile-modal-close-icon" />
            </button>

            <h3 className="edit-profile-modal-title">
              {regionSelectionAction === "singleplayer" ? "Choose a Region" : "Choose a Lobby Region"}
            </h3>
            <p className="edit-profile-modal-text">
              Pick where your game will take place!
            </p>

            <div className="home-region-grid">
              {REGION_OPTIONS.map((regionOption) => {
                const isSelected = regionOption.id === selectedRegion;

                return (
                  <button
                    key={regionOption.label}
                    type="button"
                    className={`edit-profile-mascot-option home-region-option${
                      isSelected ? " edit-profile-mascot-option-selected" : ""
                    }`}
                    onClick={() => setSelectedRegion(regionOption.id)}
                  >
                    <img
                      src={regionOption.image}
                      alt={regionOption.label}
                      className="home-region-image"
                    />
                    <span className="home-region-label">{regionOption.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="edit-profile-save-button home-region-confirm-button"
              onClick={() => void createSession(regionSelectionAction)}
              disabled={isSessionActionPending}
            >
              <span>
                {regionSelectionAction === "singleplayer" ? "Start Game" : "Create Lobby"}
              </span>
            </button>
          </div>
        </div>
      )}

      {isSessionActionPending && (
        <div className="home-loading-backdrop" role="status" aria-live="polite">
          <div className="home-loading-card">
            <LoaderCircle className="home-loading-spinner" />
            <p className="home-loading-title">{pendingActionLabel}</p>
            <p className="home-loading-text">Please wait for the server response before trying again.</p>
          </div>
        </div>
      )}

      <footer className="login-page-footer profile-page-footer">
        <div className="login-page-footer-content">
          <div className="login-page-footer-text">&copy; 2026 SoPra Group 13</div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
