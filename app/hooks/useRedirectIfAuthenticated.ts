"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";

/**
 * Redirects authenticated users to their own profile route and returns whether the auth check finished.
 *
 * @returns `true` once no complete auth state was found and the current page may render safely.
 */
export default function useRedirectIfAuthenticated(): boolean {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = React.useState<boolean>(false);

  React.useEffect(() => {
    const token = getStoredToken();
    const currentUserId = getStoredCurrentUserId();

    if (token && currentUserId) {
      router.replace(`/users/${currentUserId}`);
      return;
    }

    setIsAuthChecked(true);
  }, [router]);

  return isAuthChecked;
}
