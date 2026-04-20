"use client";

import { useApi } from "@/hooks/useApi";
import type { ApplicationError } from "@/types/error";
import type { User } from "@/types/user";
import { clearStoredAuth, getStoredCurrentUserId, getStoredToken } from "@/utils/auth";
import { CalendarDays, LogOut, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";

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

const UserProfilePage: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [user, setUser] = React.useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false);
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  React.useEffect(() => {
    const storedCurrentUserId = getStoredCurrentUserId();
    setCurrentUserId(storedCurrentUserId);

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
      setIsLoggingOut(false);
      router.push("/");
    }
  };

  if (isLoading || !user) {
    return null;
  }

  const isOwnProfile = user.id === currentUserId;
  const profileTitle = isOwnProfile ? "Your Profile" : `Profile of user ${user.username}`;

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
            <UserCircle className="profile-nav-avatar-icon" />
          </Link>
        </div>
        <div className="login-page-nav-divider" />
      </nav>

      <main className="profile-page-shell" aria-label={profileTitle}>
        <section className="profile-header-card">
          <div className="profile-header-glow" />

          <div className="profile-avatar-wrap">
            <div className="profile-avatar-frame">
              <UserCircle className="profile-nav-avatar-icon" />
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
              <div className="profile-date-badge">
                <CalendarDays className="profile-badge-icon" />
                {formatJoinedDate(user.creationDate)}
              </div>
            </div>
          </div>
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
