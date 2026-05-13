"use client";

import React from "react";
import {
  AUTH_TOKEN_CHANGED_EVENT,
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
  getStoredToken,
  validateStoredAuth,
} from "@/utils/auth";

const AuthSync: React.FC = () => {
  const isValidatingRef = React.useRef<boolean>(false);

  const syncAuth = React.useCallback(() => {
    if (isValidatingRef.current) {
      return;
    }

    const token = getStoredToken();
    const currentUserId = getStoredCurrentUserId();
    const currentMascotId = getStoredCurrentMascotId();

    if (!token && !currentUserId && !currentMascotId) {
      return;
    }

    isValidatingRef.current = true;
    void validateStoredAuth().finally(() => {
      isValidatingRef.current = false;
    });
  }, []);

  React.useEffect(() => {
    syncAuth();

    globalThis.addEventListener("storage", syncAuth);
    globalThis.addEventListener(AUTH_TOKEN_CHANGED_EVENT, syncAuth);

    return () => {
      globalThis.removeEventListener("storage", syncAuth);
      globalThis.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, syncAuth);
    };
  }, [syncAuth]);

  return null;
};

export default AuthSync;
