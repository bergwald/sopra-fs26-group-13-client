"use client";

// UNCOMMENT ALL LINES TO ACTIVATE GET PROFILE API LOGIC
// import { useApi } from "@/hooks/useApi";
// import type { ApplicationError } from "@/types/error";
import type { User } from "@/types/user";
import {
  clearStoredAuth,
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import {
  Award,
  BarChart2,
  Crosshair,
  Hash,
  LogOut,
  Settings,
  TrendingUp,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";

type ProfileUser = User & {
  id: number;
};

type ProfileStat = {
  label: string;
  value: string;
  Icon: React.ComponentType<{ className?: string }>;
  colorClassName: string;
  backgroundClassName: string;
};

type ProfileRank = {
  label: string;
  minScore: number;
  maxScore?: number;
};

const DEFAULT_PROFILE_USER: ProfileUser = {
  id: 1,
  username: "GeoMaster99",
  score: 1750,
  creation_date: "2026-01-01T00:00:00.000Z",
  bio: "Exploring the world one pixel at a time. Specializing in European architecture and rural Asian landscapes.",
  game_count: 342,
  win_rate: 0.68,
  average_distance: 24,
  mascot_id: 2,
};

const MASCOT_IMAGES: Record<number, string> = {
  1: "/mascots/earth-sunglasses.svg",
  2: "/mascots/robot-flower.svg",
  3: "/mascots/saturn-space.svg",
  4: "/mascots/smiling-sun.svg",
};

const PROFILE_RANKS: ProfileRank[] = [
  { label: "Rookie Explorer", minScore: 0, maxScore: 99 },
  { label: "Street Scout", minScore: 100, maxScore: 249 },
  { label: "Map Specialist", minScore: 250, maxScore: 499 },
  { label: "Geo Expert", minScore: 500, maxScore: 999 },
  { label: "Grandmaster", minScore: 1000 },
];

const formatJoinedDate = (creationDate?: string): string => {
  if (!creationDate) {
    return "Joined Unknown";
  }

  return `Joined ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(creationDate))}`;
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(value);
};

const formatWinRate = (value: number): string => {
  return `${Math.round(value <= 1 ? value * 100 : value)}%`;
};

const formatAverageDistance = (value: number): string => {
  return `${Math.round(value)}km`;
};

const getRankForScore = (score: number): string => {
  return PROFILE_RANKS.find((rank) => {
    const hasMinimumScore = score >= rank.minScore;
    const hasMaximumScore = rank.maxScore === undefined || score <= rank.maxScore;

    return hasMinimumScore && hasMaximumScore;
  })?.label ?? PROFILE_RANKS[0].label;
};

const UserProfilePage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  // const apiService = useApi();
  const [user, setUser] = React.useState<ProfileUser | null>(null);
  const [currentUserId, setCurrentUserIdState] = React.useState<number | null>(null);
  const [currentMascotId, setCurrentMascotIdState] = React.useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false);
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const fetchUser = React.useCallback(async (targetUserId: string) => {
    // const fetchedUser = await apiService.get<ProfileUser>(`/users/${targetUserId}`);
    // setUser({
    //   ...DEFAULT_PROFILE_USER,
    //   ...fetchedUser,
    // });

    setUser({ // HERE WE NEED TO LATER REMOVE DEFAULT USER, AND JUST USE API RESULT
      ...DEFAULT_PROFILE_USER, // REPLACE WITH "...fetchedUser,"
      id: Number(targetUserId) || DEFAULT_PROFILE_USER.id, // REMOVE " || DEFAULT_PROFILE_USER.id"
    });
  }, []); // CHANGE [] to [apiService]

  React.useEffect(() => {
    const storedCurrentUserId = getStoredCurrentUserId();
    setCurrentUserIdState(storedCurrentUserId);
    setCurrentMascotIdState(getStoredCurrentMascotId());

    if (!userId) {
      router.replace("/");
      return;
    }

    const loadUser = async () => {
      try {
        await fetchUser(userId);
      } catch (error) {
        // const appError = error as ApplicationError;

        // if (appError.status === 404) {
        //   alert("User not found.");
        //   router.replace("/");
        //   return;
        // }

        if (error instanceof Error) {
          alert(
            `Something went wrong while fetching this user:\n${error.message}`,
          );
        } else {
          alert("Something went wrong while fetching this user.");
        }
      }
    };

    loadUser();
  }, [fetchUser, router, userId]);

  const profileUser = user ?? DEFAULT_PROFILE_USER; // REMOVE THIS LATER AND JUST USE API RESULT
  const profileTitle = profileUser.id === currentUserId
    ? "Your Profile"
    : `Profile of user ${profileUser.username}`;
  const isOwnProfile = profileUser.id === currentUserId;
  const joinedDate = formatJoinedDate(profileUser.creation_date);
  const mascotId = profileUser.mascot_id;
  const mascotImage = MASCOT_IMAGES[mascotId] ?? MASCOT_IMAGES[1];
  const profileRank = getRankForScore(profileUser.score);
  const gameCount = profileUser.game_count;
  const winRate = profileUser.win_rate;
  const averageDistance = profileUser.average_distance;
  const navProfileImage = currentUserId && currentMascotId
    ? MASCOT_IMAGES[currentMascotId] ?? MASCOT_IMAGES[1]
    : null;

  const handleLogout = async (): Promise<void> => {
    if (!isOwnProfile) {
      return;
    }

    setIsLoggingOut(true);
    const token = getStoredToken();

    try {
      if (token) {
        // await apiService.post<void>("/logout", undefined, {
        //   Authorization: `Bearer ${token}`,
        // });
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(
          `Something went wrong while logging out:\n${error.message}`,
        );
      } else {
        alert("Something went wrong while logging out.");
      }
    } finally {
      // We still clear local auth state even if logout request fails.
      // WE NEED TO ALSO ADD MASCOT_ID CLEARING IF WE WANT TO STORE MASCOT_ID IN LOCAL STORAGE
      clearStoredAuth();
      setCurrentUserIdState(null);
      setIsLoggingOut(false);
    }
  };

  const stats: ProfileStat[] = [
    {
      label: "Score",
      value: formatNumber(profileUser.score),
      Icon: TrendingUp,
      colorClassName: "profile-stat-icon-blue",
      backgroundClassName: "profile-stat-icon-bg-blue",
    },
    {
      label: "Win Rate",
      value: formatWinRate(winRate),
      Icon: BarChart2,
      colorClassName: "profile-stat-icon-emerald",
      backgroundClassName: "profile-stat-icon-bg-emerald",
    },
    {
      label: "Matches Played",
      value: formatNumber(gameCount),
      Icon: Hash,
      colorClassName: "profile-stat-icon-indigo",
      backgroundClassName: "profile-stat-icon-bg-indigo",
    },
    {
      label: "Avg. Distance",
      value: formatAverageDistance(averageDistance),
      Icon: Crosshair,
      colorClassName: "profile-stat-icon-sky",
      backgroundClassName: "profile-stat-icon-bg-sky",
    },
  ];

  return (
    <div className="profile-page-root">
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
                  alt="Your mascot"
                  className="profile-nav-avatar-image"
                />
              )
              : <UserCircle className="profile-nav-avatar-icon" />}
          </Link>
        </div>
        <div className="login-page-nav-divider" />
      </nav>

      <main className="profile-page-shell" aria-label={profileTitle}>
        <section className="profile-header-card">
          <div className="profile-header-glow" />

          <div className="profile-avatar-wrap">
            <div className="profile-avatar-frame">
              <img
                src={mascotImage}
                alt={`${profileUser.username} mascot`}
                className="profile-avatar-image"
              />
            </div>
          </div>

          <div className="profile-header-content">
            <div className="profile-title-row">
              <h1 className="profile-username">{profileUser.username}</h1>
              {isOwnProfile && (
                <div className="profile-actions">
                  <Link
                    href={`/users/edit/${profileUser.id}`}
                    className="profile-edit-link"
                  >
                    <Settings className="profile-edit-icon" />
                    Edit Profile
                  </Link>
                  <button
                    type="button"
                    className="profile-edit-link profile-logout-button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="profile-edit-icon" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>

            <p className="profile-bio">
              &quot;{profileUser.bio || "No bio provided"}&quot;
            </p>

            <div className="profile-badges">
              <div className="profile-tier-badge">
                <Award className="profile-badge-icon" />
                {profileRank} Tier
              </div>
              <div className="profile-date-badge">
                {joinedDate}
              </div>
            </div>
          </div>
        </section>

        <section className="profile-stats-grid" aria-label="Profile statistics">
          {stats.map((stat) => (
            <div key={stat.label} className="profile-stat-card">
              <div
                className={`profile-stat-icon-wrap ${stat.backgroundClassName} ${stat.colorClassName}`}
              >
                <stat.Icon className="profile-stat-icon" />
              </div>
              <p className="profile-stat-label">{stat.label}</p>
              <h4 className="profile-stat-value">{stat.value}</h4>
            </div>
          ))}
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

export default UserProfilePage;
