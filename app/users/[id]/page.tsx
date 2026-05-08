"use client";

import { useApi } from "@/hooks/useApi";
import type { ApplicationError } from "@/types/error";
import type { User } from "@/types/user";
import {
  clearStoredAuth,
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import {
  Award,
  CalendarDays,
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

const MASCOT_IMAGES: Record<number, string> = {
  1: "/mascots/earth-sunglasses.svg",
  2: "/mascots/robot-flower.svg",
  3: "/mascots/saturn-space.svg",
  4: "/mascots/smiling-sun.svg",
  5: "/mascots/cactus-sunglasses.svg",
  6: "/mascots/crowned-mountain.svg",
  7: "/mascots/yellowstone-rock.svg",
  8: "/mascots/snowman-scarf.svg",
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
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
};

const formatAverageDistance = (value: number): string => {
  return `${Math.round(value)} km`;
};

const getRankForScore = (score: number): string => {
  return PROFILE_RANKS.find((rank) => {
    const hasMinimumScore = score >= rank.minScore;
    const hasMaximumScore = rank.maxScore === undefined || score <= rank.maxScore;

    return hasMinimumScore && hasMaximumScore;
  })?.label ?? PROFILE_RANKS[0].label;
};

const UserProfilePage: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [user, setUser] = React.useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [currentMascotId, setCurrentMascotId] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false);
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  React.useEffect(() => {
    const storedCurrentUserId = getStoredCurrentUserId();
    const storedCurrentMascotId = getStoredCurrentMascotId();
    setCurrentUserId(storedCurrentUserId);
    setCurrentMascotId(storedCurrentMascotId);

    if (!userId) {
      router.replace("/");
      return;
    }

    const loadUser = async () => {
      setIsLoading(true);

      try {
        const fetchedUser = await apiService.get<User>(`/users/${userId}`);
        setUser(fetchedUser);
      } catch (error) {
        const appError = error as ApplicationError;

        if (appError.status === 404) {
          alert("User not found.");
          router.replace("/");
          return;
        }

        if (error instanceof Error) {
          alert(`Something went wrong while fetching this user:\n${error.message}`);
        } else {
          alert("Something went wrong while fetching this user.");
        }
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, [apiService, router, userId]);

  const handleLogout = async (): Promise<void> => {
    if (!user || user.id !== currentUserId) {
      return;
    }

    setIsLoggingOut(true);
    const token = getStoredToken();

    try {
      if (token) {
        await apiService.post<void>("/logout", undefined, {
          Authorization: `Bearer ${token}`,
        });
      }
    } catch {
      // Clear local auth state even if the backend call fails.
    } finally {
      clearStoredAuth();
      setCurrentUserId(null);
      setCurrentMascotId(null);
      setIsLoggingOut(false);
      router.push("/");
    }
  };

  if (isLoading || !user) {
    return null;
  }

  const isOwnProfile = user.id === currentUserId;
  const profileTitle = isOwnProfile ? "Your Profile" : `Profile of user ${user.username}`;
  const mascotId = user.mascot_id ?? 1;
  const mascotImage = MASCOT_IMAGES[mascotId] ?? MASCOT_IMAGES[1];
  const navMascotImage = currentMascotId
    ? MASCOT_IMAGES[currentMascotId] ?? MASCOT_IMAGES[1]
    : undefined;
  const isLoggedIn = getStoredToken() !== null && currentUserId !== null && currentMascotId !== null;
  const rankScore = user.avg_score ?? 0;
  const profileRank = getRankForScore(rankScore);

  const stats: ProfileStat[] = [
    {
      label: "Score",
      value: user.avg_score == null ? "-" : formatNumber(user.avg_score),
      Icon: TrendingUp,
      colorClassName: "profile-stat-icon-blue",
      backgroundClassName: "profile-stat-icon-bg-blue",
    },
    {
      label: "Rounds Played",
      value: user.rounds_played == null ? "-" : formatNumber(user.rounds_played),
      Icon: Hash,
      colorClassName: "profile-stat-icon-indigo",
      backgroundClassName: "profile-stat-icon-bg-indigo",
    },
    {
      label: "Avg. Distance",
      value: user.avg_distance == null ? "-" : formatAverageDistance(user.avg_distance),
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
                alt={`${user.username} mascot`}
                className="profile-avatar-image"
              />
            </div>
          </div>

          <div className="profile-header-content">
            <div className="profile-title-row">
              <h1 className="profile-username">{user.username}</h1>
              {isOwnProfile && (
                <div className="profile-actions">
                  <Link
                    href={`/users/edit/${user.id}`}
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
              &quot;{user.bio || "No bio provided"}&quot;
            </p>

            <div className="profile-badges">
              <div className="profile-tier-badge">
                <Award className="profile-badge-icon" />
                {profileRank} Tier
              </div>
              <div className="profile-date-badge">
                <CalendarDays className="profile-badge-icon" />
                {formatJoinedDate(user.creationDate)}
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
