"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "antd";
import { useApi } from "@/hooks/useApi";
import {
  AUTH_TOKEN_CHANGED_EVENT,
  clearStoredAuth,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";

const SiteHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const apiService = useApi();
  const [hasToken, setHasToken] = React.useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false);

  // Keep header UI in sync with both auth token and current user ID.
  const syncAuthState = React.useCallback(() => {
    const token = getStoredToken();
    const storedCurrentUserId = getStoredCurrentUserId();

    // A token without a current user ID is considered invalid auth state.
    if (token && !storedCurrentUserId) {
      clearStoredAuth();
      setHasToken(false);
      setCurrentUserId(null);
      router.replace("/");
      return;
    }

    setHasToken(Boolean(token));
    setCurrentUserId(storedCurrentUserId);
  }, [router]);

  React.useEffect(() => {
    syncAuthState();
  }, [pathname, syncAuthState]);

  React.useEffect(() => {
    globalThis.addEventListener("storage", syncAuthState);
    globalThis.addEventListener(AUTH_TOKEN_CHANGED_EVENT, syncAuthState);
    return () => {
      globalThis.removeEventListener("storage", syncAuthState);
      globalThis.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, syncAuthState);
    };
  }, [syncAuthState]);

  // Function to logout the user
  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    const token = getStoredToken();

    try {
      if (token) {
        await apiService.post<void>("/logout", undefined, {
          Authorization: `Bearer ${token}`,
        });
      }
    } catch {
      // We still clear local auth state even if logout request fails.
    } finally {
      clearStoredAuth();
      setHasToken(false);
      setCurrentUserId(null);
      setIsLoggingOut(false);
      router.push("/");
    }
  };

  return (
    <header className="site-header">
      <Link href="/" className="site-home-link">
        SoPra M1 Website
      </Link>

      {hasToken && (
        <div className="site-header-actions">
          {/* Direct link to the logged-in user's own profile page. */}
          {currentUserId && (
            <Link href={`/users/${currentUserId}`} className="site-profile-link">
              Profile
            </Link>
          )}
          <Button
            type="primary"
            color="red"
            variant="solid"
            onClick={handleLogout}
            loading={isLoggingOut}
          >
            Logout
          </Button>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
