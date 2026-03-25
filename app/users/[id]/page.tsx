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
import { User, UserSelfUpdateRequest } from "@/types/user";
import {
  clearStoredAuth,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";
import { Alert, Button, Card, Descriptions, Input, Space, Typography } from "antd";

const MAX_BIO_LENGTH = 280;

const Profile: React.FC = () => {
  const router = useRouter();
  // Read the user ID from the URL route parameter
  const params = useParams<{ id: string }>();
  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserIdState] = useState<number | null>(null);
  const [bioDraft, setBioDraft] = useState<string>("");
  const [originalBio, setOriginalBio] = useState<string>("");
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [isSavingBio, setIsSavingBio] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const formattedCreationDate = user?.creationDate
    ? new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(user.creationDate))
    : "Unknown";

  const fetchUser = React.useCallback(async (token: string, targetUserId: string) => {
    const fetchedUser = await apiService.get<User>(`/users/${targetUserId}`, {
      Authorization: `Bearer ${token}`,
    });

    setUser(fetchedUser);
    setBioDraft(fetchedUser.bio ?? "");
    setOriginalBio(fetchedUser.bio ?? "");
  }, [apiService]);

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
    const loadUser = async () => {
      try {
        await fetchUser(token, userId);
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

    loadUser();
  }, [fetchUser, router, userId]);

  let profileTitle = "Loading user...";
  if (user) {
    // Show a custom title when the logged-in user views their own profile.
    profileTitle = user.id === currentUserId
      ? "Your Profile"
      : `Profile of user ${user.username}`;
  }
  const isOwnProfile = user?.id === currentUserId;
  const isBioChanged = bioDraft !== originalBio;
  const isBioTooLong = bioDraft.length > MAX_BIO_LENGTH;
  const renderStatus = (status: User["status"]) => {
    if (status === "ONLINE") {
      return <span style={{ color: "#52c41a", fontWeight: 600 }}>{status}</span>;
    }

    if (status === "OFFLINE") {
      return <span style={{ color: "#ff4d4f", fontWeight: 600 }}>{status}</span>;
    }

    return status;
  };

  const handleStartEditingBio = () => {
    setBioDraft(originalBio);
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditingBio(true);
  };

  const handleCancelEditingBio = () => {
    setBioDraft(originalBio);
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditingBio(false);
  };

  const handleSaveBio = async () => {
    const token = getStoredToken();

    if (!token || !currentUserId || !userId) {
      clearStoredAuth();
      router.replace("/");
      return;
    }

    if (!isBioChanged) {
      return;
    }

    if (isBioTooLong) {
      setErrorMessage(`Bio must be at most ${MAX_BIO_LENGTH} characters.`);
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSavingBio(true);

    try {
      const payload: UserSelfUpdateRequest = {
        bio: bioDraft,
      };

      await apiService.put<void>(`/users/${currentUserId}`, payload, {
        Authorization: `Bearer ${token}`,
      });

      await fetchUser(token, userId);
      setIsEditingBio(false);
      setSuccessMessage("Bio updated successfully.");
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

      if (appError.status === 400) {
        setErrorMessage(
          `Bio must be at most ${MAX_BIO_LENGTH} characters after trimming.`,
        );
        return;
      }

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Bio update failed. Please try again.");
      }
    } finally {
      setIsSavingBio(false);
    }
  };

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
                {renderStatus(user.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Bio">
                {isOwnProfile && isEditingBio
                  ? (
                    <Space
                      direction="vertical"
                      size="small"
                      className="profile-bio-editor"
                    >
                      <Input.TextArea
                        value={bioDraft}
                        onChange={(event) => {
                          setBioDraft(event.target.value);
                          setErrorMessage("");
                          setSuccessMessage("");
                        }}
                        maxLength={MAX_BIO_LENGTH}
                        showCount
                        autoSize={{ minRows: 4, maxRows: 8 }}
                        placeholder="Tell other players a bit about yourself."
                      />
                      <Typography.Text type="secondary">
                        Whitespace-only bios are allowed and will be stored as
                        empty.
                      </Typography.Text>
                    </Space>
                  )
                  : (user.bio || "No bio provided")}
              </Descriptions.Item>
              <Descriptions.Item label="Registration Date">
                {formattedCreationDate}
              </Descriptions.Item>
            </Descriptions>

            {errorMessage && (
              <Alert
                type="error"
                showIcon
                message={errorMessage}
                className="profile-feedback-alert"
              />
            )}
            {successMessage && (
              <Alert
                type="success"
                showIcon
                message={successMessage}
                className="profile-feedback-alert"
              />
            )}

            <Space>
              {/* Button to the user overview page */}
              <Button type="default" onClick={() => router.push("/users")}>
                Users Overview
              </Button>
              {isOwnProfile && !isEditingBio && (
                <Button type="primary" onClick={handleStartEditingBio}>
                  Edit Bio
                </Button>
              )}
              {isOwnProfile && isEditingBio && (
                <>
                  <Button
                    type="primary"
                    onClick={handleSaveBio}
                    loading={isSavingBio}
                    disabled={!isBioChanged || isBioTooLong}
                  >
                    Save Bio
                  </Button>
                  <Button
                    type="default"
                    onClick={handleCancelEditingBio}
                    disabled={isSavingBio}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {/* Button to the page to change the password */}
              {isOwnProfile && currentUserId && (
                <Button
                  type="default"
                  onClick={() => router.push(`/users/${currentUserId}/password`)}
                >
                  Change Password
                </Button>
              )}
            </Space>
          </Space>
        )}
      </Card>
    </div>
  );
};

export default Profile;
