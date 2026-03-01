"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "antd";
import { useApi } from "@/hooks/useApi";
import { clearStoredToken, getStoredToken } from "@/utils/auth";

const SiteHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const apiService = useApi();
  const [hasToken, setHasToken] = React.useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false);

  React.useEffect(() => {
    setHasToken(Boolean(getStoredToken()));
  }, [pathname]);

  React.useEffect(() => {
    const syncTokenState = () => setHasToken(Boolean(getStoredToken()));
    globalThis.addEventListener("storage", syncTokenState);
    return () => globalThis.removeEventListener("storage", syncTokenState);
  }, []);

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
      clearStoredToken();
      setHasToken(false);
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
          <Button type="primary" onClick={handleLogout} loading={isLoggingOut}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
