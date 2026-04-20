"use client";

import { useApi } from "@/hooks/useApi";
import type { ApplicationError } from "@/types/error";
import type { User, UserSelfUpdateRequest } from "@/types/user";
// import {
//   getStoredCurrentMascotId,
//   setStoredCurrentMascotId,
// } from "@/utils/auth";
import { clearStoredAuth, getStoredCurrentUserId, getStoredToken } from "@/utils/auth";
// import { Camera, X } from "lucide-react";
import { ArrowLeft, Save, UserCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";

type EditProfileFormValues = {
  username: string;
  bio: string;
  newPassword: string;
  // mascot_id: number;
};

// const MASCOT_IMAGES: Record<number, string> = {
//   1: "/mascots/earth-sunglasses.svg",
//   2: "/mascots/robot-flower.svg",
//   3: "/mascots/saturn-space.svg",
//   4: "/mascots/smiling-sun.svg",
// };

const UserSettingsPage: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [isAuthChecked, setIsAuthChecked] = React.useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  // const [showMascotModal, setShowMascotModal] = React.useState<boolean>(false);
  // const [currentMascotId, setCurrentMascotId] = React.useState<number | null>(null);
  const [initialValues, setInitialValues] = React.useState<EditProfileFormValues>({
    username: "",
    bio: "",
    newPassword: "",
    // mascot_id: 1,
  });
  const [formValues, setFormValues] = React.useState<EditProfileFormValues>({
    username: "",
    bio: "",
    newPassword: "",
    // mascot_id: 1,
  });

  const routeUserId = Array.isArray(params.id) ? params.id[0] : params.id;
  // const selectedMascotImage = MASCOT_IMAGES[formValues.mascot_id] ?? MASCOT_IMAGES[1];
  // const navProfileImage = currentUserId && currentMascotId
  //   ? MASCOT_IMAGES[currentMascotId] ?? MASCOT_IMAGES[1]
  //   : null;

  React.useEffect(() => {
    const parsedRouteUserId = Number(routeUserId);

    if (!Number.isInteger(parsedRouteUserId) || parsedRouteUserId <= 0) {
      router.replace("/");
      return;
    }

    const token = getStoredToken();
    const storedCurrentUserId = getStoredCurrentUserId();
    // const storedCurrentMascotId = getStoredCurrentMascotId();

    if (!token || !storedCurrentUserId) {
      clearStoredAuth();
      router.replace(`/users/${parsedRouteUserId}`);
      return;
    }

    if (parsedRouteUserId !== storedCurrentUserId) {
      router.replace(`/users/${storedCurrentUserId}`);
      return;
    }

    const loadUser = async () => {
      try {
        const fetchedUser = await apiService.get<User>(`/users/${parsedRouteUserId}`);
        const nextFormValues = {
          username: fetchedUser.username,
          bio: fetchedUser.bio ?? "",
          newPassword: "",
          // mascot_id: fetchedUser.mascot_id ?? 1,
        };

        setInitialValues(nextFormValues);
        setFormValues(nextFormValues);
        setCurrentUserId(storedCurrentUserId);
        // setCurrentMascotId(storedCurrentMascotId);
        setIsAuthChecked(true);
      } catch (error) {
        const appError = error as ApplicationError;

        if (appError.status === 404) {
          alert("User not found.");
          router.replace("/");
          return;
        }

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Profile could not be loaded. Please try again.");
        }
      }
    };

    void loadUser();
  }, [apiService, routeUserId, router]);

  const handleEditProfile = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!currentUserId) {
      router.replace(`/users/${routeUserId}`);
      return;
    }

    const token = getStoredToken();

    if (!token) {
      clearStoredAuth();
      router.replace(`/users/${currentUserId}`);
      return;
    }

    setErrorMessage("");

    const payload: UserSelfUpdateRequest = {};
    const trimmedBio = formValues.bio.trim();
    const trimmedPassword = formValues.newPassword.trim();

    if (trimmedBio !== initialValues.bio) {
      payload.bio = trimmedBio;
    }

    // if (formValues.mascot_id !== initialValues.mascot_id) {
    //   payload.mascot_id = formValues.mascot_id;
    // }

    if (trimmedPassword) {
      if (trimmedPassword.length < 8) {
        setErrorMessage("Password must contain at least 8 characters.");
        return;
      }

      payload.newPassword = trimmedPassword;
    }

    if (Object.keys(payload).length === 0) {
      setErrorMessage("No changes to save.");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiService.put<void>(`/users/${currentUserId}`, payload, {
        Authorization: `Bearer ${token}`,
      });

      if (payload.newPassword) {
        clearStoredAuth();
        alert("Password changed successfully. Please log in again.");
        router.replace("/login");
        return;
      }

      // if (payload.mascot_id) {
      //   setStoredCurrentMascotId(payload.mascot_id);
      //   setCurrentMascotId(payload.mascot_id);
      // }

      router.push(`/users/${currentUserId}`);
    } catch (error) {
      const appError = error as ApplicationError;

      if (appError.status === 401) {
        clearStoredAuth();
        router.replace(`/users/${currentUserId}`);
        return;
      }

      if (appError.status === 404) {
        alert("User not found.");
        router.replace(`/users/${currentUserId}`);
        return;
      }

      if (appError.status === 400) {
        setErrorMessage("Please check your input and try again.");
        return;
      }

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Profile update failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthChecked) {
    return null;
  }

  return (
    <div className="profile-page-root">
      <div className="login-page-background" />

      <nav className="login-page-nav profile-page-nav">
        <div className="login-page-nav-left">
          <Link href="/" className="login-page-brand">
            <div className="login-page-brand-icon" aria-hidden="true">
              G
            </div>
            <span className="login-page-brand-text">GeoGuess</span>
          </Link>
        </div>

        <div className="login-page-nav-right">
          <Link
            href={currentUserId ? `/users/${currentUserId}` : "/login"}
            className="profile-nav-avatar-link"
            aria-label={currentUserId ? "Open your profile" : "Open login page"}
          >
            {/* {navProfileImage
              ? (
                <img
                  src={navProfileImage}
                  alt="Your mascot"
                  className="profile-nav-avatar-image"
                />
              )
              : <UserCircle className="profile-nav-avatar-icon" />} */}
            <UserCircle className="profile-nav-avatar-icon" />
          </Link>
        </div>
        <div className="login-page-nav-divider" />
      </nav>

      <main className="edit-profile-page-shell">
        <div className="edit-profile-title-row">
          <button
            type="button"
            onClick={() => router.push(`/users/${currentUserId}`)}
            className="edit-profile-back-button"
            aria-label="Back to profile"
          >
            <ArrowLeft className="edit-profile-back-icon" />
          </button>
          <h1 className="edit-profile-title">Edit Profile</h1>
        </div>

        <section className="edit-profile-card">
          <form className="edit-profile-form" onSubmit={handleEditProfile}>
            <div className="edit-profile-avatar-section">
              {/* <button
                type="button"
                className="edit-profile-avatar-button"
                onClick={() => setShowMascotModal(true)}
                aria-label="Change mascot"
              >
                <span className="edit-profile-avatar-frame">
                  <img
                    src={selectedMascotImage}
                    alt="Selected mascot"
                    className="edit-profile-avatar-image"
                  />
                </span>
                <span className="edit-profile-avatar-overlay" aria-hidden="true">
                  <Camera className="edit-profile-avatar-camera" />
                </span>
              </button> */}
              <span className="edit-profile-avatar-frame">
                <UserCircle className="profile-nav-avatar-icon" />
              </span>
              <p className="edit-profile-avatar-hint">Profile picture is not editable yet.</p>
            </div>

            <hr className="edit-profile-divider" />

            <div className="edit-profile-fields">
              <div className="login-field-group">
                <label htmlFor="username" className="login-label">Username</label>
                <input
                  id="username"
                  type="text"
                  value={formValues.username}
                  disabled
                  className="edit-profile-input edit-profile-input-disabled"
                />
              </div>

              <div className="login-field-group">
                <label htmlFor="bio" className="login-label">Bio</label>
                <textarea
                  id="bio"
                  rows={3}
                  value={formValues.bio}
                  className="edit-profile-input edit-profile-textarea"
                  onChange={(event) =>
                    setFormValues((previousValues) => ({
                      ...previousValues,
                      bio: event.target.value,
                    }))}
                />
              </div>

              <div className="login-field-group edit-profile-password-field">
                <label htmlFor="newPassword" className="login-label">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={formValues.newPassword}
                  placeholder="Leave blank to keep current"
                  className="edit-profile-input"
                  onChange={(event) =>
                    setFormValues((previousValues) => ({
                      ...previousValues,
                      newPassword: event.target.value,
                    }))}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="login-field-error" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="edit-profile-button-row">
              <button
                type="submit"
                className="edit-profile-save-button"
                disabled={isSubmitting}
              >
                <Save className="edit-profile-save-icon" />
                <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
              </button>
              <button
                type="button"
                className="edit-profile-cancel-button"
                onClick={() => router.push(`/users/${currentUserId}`)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* {showMascotModal && (
        <div className="edit-profile-modal-backdrop">
          <div className="edit-profile-modal" role="dialog" aria-modal="true">
            <button
              type="button"
              onClick={() => setShowMascotModal(false)}
              className="edit-profile-modal-close"
              aria-label="Close mascot selection"
            >
              <X className="edit-profile-modal-close-icon" />
            </button>

            <h3 className="edit-profile-modal-title">Choose Mascot</h3>
            <p className="edit-profile-modal-text">
              Pick the picture that should be shown on your profile.
            </p>

            <div className="edit-profile-mascot-grid">
              {Object.entries(MASCOT_IMAGES).map(([id, image]) => {
                const mascotId = Number(id);
                const isSelected = mascotId === formValues.mascot_id;

                return (
                  <button
                    key={id}
                    type="button"
                    className={`edit-profile-mascot-option${
                      isSelected ? " edit-profile-mascot-option-selected" : ""
                    }`}
                    onClick={() => {
                      setFormValues((previousValues) => ({
                        ...previousValues,
                        mascot_id: mascotId,
                      }));
                      setShowMascotModal(false);
                    }}
                  >
                    <img
                      src={image}
                      alt={`Mascot ${id}`}
                      className="edit-profile-mascot-image"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )} */}

      <footer className="login-page-footer profile-page-footer">
        <div className="login-page-footer-content">
          <div className="login-page-footer-text">&copy; 2026 SoPra Group 13</div>
        </div>
      </footer>
    </div>
  );
};

export default UserSettingsPage;
