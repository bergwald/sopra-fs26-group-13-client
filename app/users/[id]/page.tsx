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
import {
  clearStoredAuth,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import { Button, Card, Descriptions, Space } from "antd";

const Profile: React.FC = () => {
  const router = useRouter();
  // Read the user ID from the URL route parameter
  const params = useParams<{ id: string }>();
  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserIdState] = useState<number | null>(null);

  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const formattedCreationDate = user?.creationDate
    ? new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(user.creationDate))
    : "Unknown";

  useEffect(() => {
    const token = getStoredToken();
    const storedCurrentUserId = getStoredCurrentUserId();

    // Token and current-user ID must always exist together in authenticated routes.
    if (!token || !storedCurrentUserId) {
      clearStoredAuth();
      router.replace("/");
      return;
    }

    if (!userId) {
      router.replace("/users");
      return;
    }

    setCurrentUserIdState(storedCurrentUserId);

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
          clearStoredAuth();
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

  let profileTitle = "Loading user...";
  if (user) {
    // Show a custom title when the logged-in user views their own profile.
    profileTitle = user.id === currentUserId
      ? "Your Profile"
      : `Profile of user ${user.username}`;
  }

  return (
    <div className="card-container">
      <Card
        title={profileTitle}
        loading={!user}
        className="dashboard-container profile-card"
      >
        {user && (
          <Space orientation="vertical" size="large" className="profile-content">
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
              <Descriptions.Item label="Registration Date">
                {formattedCreationDate}
              </Descriptions.Item>
            </Descriptions>

            <Space>
              {/* Button to the user overview page */}
              <Button type="default" onClick={() => router.push("/users")}>
                Back to users
              </Button>
            </Space>
          </Space>
        )}
      </Card>
    </div>
  );
};

export default Profile;
