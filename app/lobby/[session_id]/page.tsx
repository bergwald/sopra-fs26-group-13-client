"use client";

import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import {
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import {
  Clock3,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";


const buildAuthorizedHeaders = (token: string, userId: number): HeadersInit => {
  return {
    Authorization: `Bearer ${token}`,
    userId: String(userId),
  };
};

const LobbyPage: React.FC = () => {
  const params = useParams();
  const sessionId = params?.session_id as string | undefined;
  const router = useRouter();
  const [sessionUsers, setSessionUsers] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

useEffect(() => {
  if (!sessionId) return;

  let cancelled = false;
  let intervalId: ReturnType<typeof setTimeout> | null = null;
  let backoffMs = 2000; // start backoff on error
  const POLL_INTERVAL = 5000; // normal polling interval

  const fetchSessionData = async () => {
    try {
      const token = getStoredToken();
      const storedCurrentUserId = getStoredCurrentUserId();
      if (!token || !storedCurrentUserId) {
        router.replace("/");
        return;
      }

      const headers = buildAuthorizedHeaders(token, storedCurrentUserId);
      const response = await api.get<Record<string, any>[]>(`/session/${sessionId}`, headers);

      if (cancelled) return;

      setSessionUsers(response);
      setError(null);
      setLoading(false);
      backoffMs = 2000; // reset backoff after success
    } catch (err) {
      if (cancelled) return;
      console.error(err);
      setError("Failed to fetch session data. Retrying...");
      setLoading(false);
      backoffMs = Math.min(backoffMs * 2, 30000); // exponential backoff cap 30s
    } finally {
      if (cancelled) return;
      // schedule next poll using backoff (if error) or normal interval
      const next = error ? backoffMs : POLL_INTERVAL;
      intervalId = setTimeout(fetchSessionData, next);
    }
  };

  // initial fetch immediately
  fetchSessionData();

  return () => {
    cancelled = true;
    if (intervalId) clearTimeout(intervalId);
  };
}, [sessionId, router, api]);

  if (loading) {
    return (
      <div className="login-container">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="login-container">
        {error}
      </div>
    );
  }

  // Extract session details from the first user (assuming all users in the session share the same session details)
  const sessionExpiryDateTime = sessionUsers[0]?.sessionExpiryDateTime;
  const roundNumber = sessionUsers[0]?.roundNumber;

  return (
    <div className="game-page-shell">
      <div className="game-page-background" />

      <nav className="login-page-nav game-page-nav">
        <div className="login-page-nav-left">
          <Link href="/" className="login-page-brand">
            <div className="login-page-brand-icon" aria-hidden="true">
              G
            </div>
            <span className="login-page-brand-text">MountainGuessr</span>
          </Link>
        </div>

        <div className="game-page-nav-center">
          <div className="game-page-status-pill">
            <Clock3 className="game-page-status-icon" />
            <span>Session Timer</span>
            <strong>{new Date(sessionExpiryDateTime!).toLocaleString()}</strong>
          </div>
        </div>

        <div className="login-page-nav-right">
          <Link href="/" className="profile-nav-avatar-link" aria-label="Go to homepage">
            <UserCircle className="profile-nav-avatar-icon" />
          </Link>
        </div>
        <div className="login-page-nav-divider" />
      </nav>

      <main className="game-page-main">
        <section className="game-hero-panel">

          <div className="game-page-overlay">

            <section className="lobby-users-panel" aria-label="Users in session">
              <h2 className="text-xl font-semibold mb-4">Users in Session</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b">
                        <UserCircle className="h-5 w-5 inline-block mr-1" />
                        User ID
                      </th>
                      <th className="py-2 px-4 border-b">Role</th>
                      <th className="py-2 px-4 border-b">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{user.id}</td>
                        <td className="py-2 px-4 border-b">{user.userRole}</td>
                        <td className="py-2 px-4 border-b">{user.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LobbyPage;