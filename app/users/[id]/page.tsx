// User profile page

// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { ApplicationError } from "@/types/error";
import { User } from "@/types/user";
import { clearStoredToken, getStoredToken } from "@/utils/auth";
import { Button, Card, Descriptions, Space } from "antd";

const Profile: React.FC = () => {
  const router = useRouter();
  // Read the user ID from the URL route parameter
  const params = useParams<{ id: string }>();
  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string>("");

  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Function to logout the user
  const handleLogout = async (): Promise<void> => {
    try {
      if (authToken) {
        await apiService.post<void>("/logout", undefined, {
          Authorization: `Bearer ${authToken}`,
        });
      }
    } catch {
      // We still clear local auth state even if logout request fails.
    } finally {
      clearStoredToken();
      router.push("/");
    }
  };

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      clearStoredToken();
      router.replace("/");
      return;
    }

    if (!userId) {
      router.replace("/users");
      return;
    }

    setAuthToken(token);

    // Function to fetch user data from the backend
    const fetchUser = async () => {
      try {
        const fetchedUser = await apiService.get<User>(`/users/${userId}`, {
          Authorization: `Bearer ${token}`,
        });
        setUser(fetchedUser);
      } catch (error) {
        const appError = error as ApplicationError;

        if (appError.status === 401) {
          clearStoredToken();
          router.replace("/");
          return;
        }

        if (appError.status === 404) {
          alert("User not found.");
          router.replace("/users");
          return;
        }

        if (error instanceof Error) {
          alert(
            `Something went wrong while fetching this user:\n${error.message}`,
          );
        } else {
          alert("Something went wrong while fetching this user.");
        }
      }
    };

    fetchUser();
  }, [apiService, router, userId]);

  return (
    <div className="card-container">
      <Card
        title={user ? `Profile of user ${user.username}` : "Loading user..."}
        loading={!user}
        className="dashboard-container"
      >
        {user && (
          <Space orientation="vertical" size="large">
            <Descriptions className="profile-descriptions" column={1} bordered>
              <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
              <Descriptions.Item label="Username">
                {user.username}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {user.status}
              </Descriptions.Item>
              <Descriptions.Item label="Bio">
                {user.bio || "No bio provided"}
              </Descriptions.Item>
            </Descriptions>

            <Space>
              {/* Button to the user overview page */}
              <Button type="default" onClick={() => router.push("/users")}>
                Back to users
              </Button>
              {/* Logout button */}
              <Button type="primary" onClick={handleLogout}>
                Logout
              </Button>
            </Space>
          </Space>
        )}
      </Card>
    </div>
  );
};

export default Profile;
