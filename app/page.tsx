"use client";

// UNCOMMENT ALL LINES TO ACTIVATE HOMEPAGE API LOGIC
// import { useApi } from "@/hooks/useApi";
// import type { ApplicationError } from "@/types/error";
import type { User } from "@/types/user";
import {
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import {
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

type LeaderboardUser = User & {
  id: number;
};

const MASCOT_IMAGES: Record<number, string> = {
  1: "/mascots/earth-sunglasses.svg",
  2: "/mascots/robot-flower.svg",
  3: "/mascots/saturn-space.svg",
  4: "/mascots/smiling-sun.svg",
};

const DEFAULT_LEADERBOARD_USERS: LeaderboardUser[] = [
  {
    id: 11,
    username: "AtlasAce",
    score: 3580,
    creation_date: "2026-01-01T00:00:00.000Z",
    bio: "",
    game_count: 0,
    win_rate: 0,
    average_distance: 12.4,
    mascot_id: 1,
  },
  {
    id: 12,
    username: "MapMarauder",
    score: 3440,
    creation_date: "2026-01-01T00:00:00.000Z",
    bio: "",
    game_count: 0,
    win_rate: 0,
    average_distance: 14.1,
    mascot_id: 2,
  },
  {
    id: 13,
    username: "GeoSprint",
    score: 3375,
    creation_date: "2026-01-01T00:00:00.000Z",
    bio: "",
    game_count: 0,
    win_rate: 0,
    average_distance: 16.8,
    mascot_id: 3,
  },
  {
    id: 14,
    username: "RoadSignWhisperer",
    score: 3290,
    creation_date: "2026-01-01T00:00:00.000Z",
    bio: "",
    game_count: 0,
    win_rate: 0,
    average_distance: 18.2,
    mascot_id: 4,
  },
  {
    id: 15,
    username: "PeakPin",
    score: 3210,
    creation_date: "2026-01-01T00:00:00.000Z",
    bio: "",
    game_count: 0,
    win_rate: 0,
    average_distance: 19.3,
    mascot_id: 2,
  },
  {
    id: 16,
    username: "BorderBlink",
    score: 3155,
    creation_date: "2026-01-01T00:00:00.000Z",
    bio: "",
    game_count: 0,
    win_rate: 0,
    average_distance: 21.4,
    mascot_id: 1,
  },
  {
    id: 17,
    username: "CompassCloud",
    score: 3080,
    creation_date: "2026-01-01T00:00:00.000Z",
    bio: "",
    game_count: 0,
    win_rate: 0,
    average_distance: 22.9,
    mascot_id: 3,
  },
  {
    id: 18,
    username: "UrbanContour",
    score: 2995,
    creation_date: "2026-01-01T00:00:00.000Z",
    bio: "",
    game_count: 0,
    win_rate: 0,
    average_distance: 24.7,
    mascot_id: 4,
  },
  {
    id: 19,
    username: "LongitudeLoop",
    score: 2910,
    creation_date: "2026-01-01T00:00:00.000Z",
    bio: "",
    game_count: 0,
    win_rate: 0,
    average_distance: 26.1,
    mascot_id: 2,
  },
  {
    id: 20,
    username: "TrailLens",
    score: 2840,
    creation_date: "2026-01-01T00:00:00.000Z",
    bio: "",
    game_count: 0,
    win_rate: 0,
    average_distance: 28.6,
    mascot_id: 1,
  },
];

const sortLeaderboardUsers = (users: LeaderboardUser[]): LeaderboardUser[] => {
  return [...users]
    .sort((firstUser, secondUser) => secondUser.score - firstUser.score)
    .slice(0, 10);
};

const formatScore = (score: number): string => {
  return new Intl.NumberFormat("en-US").format(score);
};

const formatDistance = (distance: number): string => {
  return `${distance.toFixed(1)} km`;
};

const HomePage: React.FC = () => {
  const router = useRouter();
  // const apiService = useApi();
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [currentMascotId, setCurrentMascotId] = React.useState<number | null>(null);
  const [leaderboardUsers, setLeaderboardUsers] = React.useState<LeaderboardUser[]>(
    sortLeaderboardUsers(DEFAULT_LEADERBOARD_USERS),
  );
  const [isMultiplayerOpen, setIsMultiplayerOpen] = React.useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = React.useState<boolean>(false);
  const [sessionIdInput, setSessionIdInput] = React.useState<string>("");

  React.useEffect(() => {
    const token = getStoredToken();
    const storedCurrentUserId = getStoredCurrentUserId();
    const storedCurrentMascotId = getStoredCurrentMascotId();

    setCurrentUserId(storedCurrentUserId);
    setCurrentMascotId(storedCurrentMascotId);

    const loadLeaderboard = async () => {
      try {
        // This follows the same `/users` API shape your old overview page used.
        // Once the backend returns the top 10 directly, you can remove the sort/slice.
        // const fetchedUsers = await apiService.get<LeaderboardUser[]>("/users", {
        //   Authorization: `Bearer ${token}`,
        // });
        //
        // setLeaderboardUsers(
        //   sortLeaderboardUsers(
        //     fetchedUsers.map((user) => ({
        //       ...user,
        //       mascot_id: user.mascot_id ?? 1,
        //     })),
        //   ),
        // );

        void token;
        setLeaderboardUsers(sortLeaderboardUsers(DEFAULT_LEADERBOARD_USERS));
      } catch (error) {
        // const appError = error as ApplicationError;
        //
        // if (appError.status === 401) {
        //   clearStoredAuth();
        //   router.replace("/");
        //   return;
        // }

        if (error instanceof Error) {
          alert(`Something went wrong while loading the leaderboard:\n${error.message}`);
        } else {
          alert("Something went wrong while loading the leaderboard.");
        }
      }
    };

    loadLeaderboard();
  }, []);

  const navProfileImage = currentMascotId
    ? MASCOT_IMAGES[currentMascotId] ?? MASCOT_IMAGES[1]
    : null;

  const handleSingleplayer = async () => {
    try {
      const demoSessionId = "1";

      // Example backend direction:
      // const response = await apiService.post<GameSession>(
      //   "/sessions/singleplayer",
      //   undefined,
      //   { Authorization: `Bearer ${getStoredToken()}` },
      // );
      //
      // A real singleplayer response should contain the new session ID.
      // router.push(`/game/${response.session_id}`);

      router.push(`/game/${demoSessionId}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong while creating a singleplayer session:\n${error.message}`);
      } else {
        alert("Something went wrong while creating a singleplayer session.");
      }
    }
  };

  const handleCreateMultiplayer = async () => {
    try {
      const demoSessionId = "demo-multiplayer-session";

      // Example backend direction:
      // const response = await apiService.post<GameSession>(
      //   "/sessions/multiplayer",
      //   undefined,
      //   { Authorization: `Bearer ${getStoredToken()}` },
      // );
      //
      // Once the backend creates a room, send players into that lobby.
      // router.push(`/lobby/${response.session_id}`);

      router.push(`/lobby/${demoSessionId}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong while creating a multiplayer session:\n${error.message}`);
      } else {
        alert("Something went wrong while creating a multiplayer session.");
      }
    }
  };

  const handleJoinSession = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedSessionId = sessionIdInput.trim();

    if (!normalizedSessionId) {
      return;
    }

    try {
      // Example backend direction:
      // await apiService.post<void>(
      //   `/sessions/${normalizedSessionId}/join`,
      //   undefined,
      //   { Authorization: `Bearer ${getStoredToken()}` },
      // );
      //
      // If the backend accepts the join, route the player into that lobby.
      // router.push(`/lobby/${normalizedSessionId}`);

      router.push(`/lobby/${normalizedSessionId}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong while joining this session:\n${error.message}`);
      } else {
        alert("Something went wrong while joining this session.");
      }
    }
  };
  return (
    <div className="home-page-root">
      <div className="login-page-background" />

      <nav className="login-page-nav profile-page-nav">
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
            href={currentUserId ? `/users/${currentUserId}` : "/login"}
            className="profile-nav-avatar-link"
            aria-label={currentUserId ? "Open your profile" : "Open login page"}
          >
            {navProfileImage
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
            <h1 className="home-hero-title">Jump into the next geography round</h1>
            <p className="home-hero-text">
              Start a solo session, create a multiplayer lobby, or join an
              existing room with a session ID.
            </p>
          </div>

          <div className="home-play-grid">
            <button
              type="button"
              onClick={handleSingleplayer}
              className="home-play-card home-play-card-blue"
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
              onClick={() => setIsMultiplayerOpen((previousValue) => !previousValue)}
              className={`home-play-card home-play-card-indigo ${isMultiplayerOpen ? "home-play-card-active" : ""}`}
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
                  onClick={handleCreateMultiplayer}
                  className="home-multiplayer-button"
                >
                  <div className="home-multiplayer-button-icon home-multiplayer-button-icon-blue">
                    <Plus className="home-multiplayer-button-icon-svg" />
                  </div>
                  <span>Create Session</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(true)}
                  className="home-multiplayer-button"
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
                {leaderboardUsers.map((leaderboardUser, index) => {
                  const mascotImage = MASCOT_IMAGES[leaderboardUser.mascot_id] ?? MASCOT_IMAGES[1];

                  return (
                    <tr key={leaderboardUser.id}>
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
                          className="home-player-link"
                        >
                          <span className="home-player-avatar">
                            <img
                              src={mascotImage}
                              alt={`${leaderboardUser.username} mascot`}
                              className="home-player-avatar-image"
                            />
                          </span>
                          <span className="home-player-name">{leaderboardUser.username}</span>
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
              />
              <button
                type="submit"
                className="home-modal-submit"
                disabled={!sessionIdInput.trim()}
              >
                Join Lobby
              </button>
            </form>
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
