"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  clearStoredAuth,
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
  getStoredToken,
  validateStoredAuth,
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
    let isActive = true;

    const token = getStoredToken();
    const currentUserId = getStoredCurrentUserId();
    const currentMascotId = getStoredCurrentMascotId();

    if ((token && !currentUserId) || (!token && (currentUserId || currentMascotId))) {
      clearStoredAuth();
    }

    if (!token || !currentUserId) {
      setIsAuthChecked(true);
      return () => {
        isActive = false;
      };
    }

    const validateAndRedirect = async (): Promise<void> => {
      const validation = await validateStoredAuth();

      if (!isActive) {
        return;
      }

      if (validation.status === "authenticated") {
        router.replace(`/users/${validation.userId}`);
        return;
      }

      setIsAuthChecked(true);
    };

    void validateAndRedirect();

    return () => {
      isActive = false;
    };
  }, [router]);

  return isAuthChecked;
}
