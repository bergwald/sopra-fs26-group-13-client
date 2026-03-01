"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/utils/auth";

/**
 * Redirects authenticated users to a target route and returns whether the auth check finished.
 *
 * @param redirectPath The route to navigate to if a token is present.
 * @returns `true` once no token was found and the current page may render safely.
 */
export default function useRedirectIfAuthenticated(
  redirectPath: string = "/users",
): boolean {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (getStoredToken()) {
      router.replace(redirectPath);
      return;
    }
    setIsAuthChecked(true);
  }, [redirectPath, router]);

  return isAuthChecked;
}
