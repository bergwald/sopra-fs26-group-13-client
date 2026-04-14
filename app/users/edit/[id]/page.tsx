"use client";

// UNCOMMENT ALL LINES TO ACTIVATE EDIT PROFILE API LOGIC
// import { useApi } from "@/hooks/useApi";
import type { ApplicationError } from "@/types/error";
import type { User, UserSelfUpdateRequest } from "@/types/user";
import {
  clearStoredAuth,
  getStoredCurrentMascotId,
  getStoredCurrentUserId,
  getStoredToken,
  setStoredCurrentMascotId,
} from "@/utils/auth";
import { ArrowLeft, Camera, Save, UserCircle, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";

type EditableProfileUser = User & {
  id: number;
};

type EditProfileFormValues = {
  username: string;
  bio: string;
  mascot_id: number;
  newPassword: string;
};

// WILL LATER BE DELEATED, JUST TO VIEW THE PAGE WITHOUT BACKEND
const DEFAULT_EDIT_PROFILE_TOKEN = "default-edit-profile-token";
const DEFAULT_EDIT_PROFILE_USER: EditableProfileUser = {
  id: 1,
  username: "GeoMaster99",
  score: 1750,
  creation_date: "2026-01-01T00:00:00.000Z",
  bio: "Exploring the world one pixel at a time. Specializing in European architecture and rural Asian landscapes.",
  game_count: 342,
  win_rate: 0.68,
  average_distance: 24,
  mascot_id: 2,
};

const MASCOT_IMAGES: Record<number, string> = {
  1: "/mascots/earth-sunglasses.svg",
  2: "/mascots/robot-flower.svg",
  3: "/mascots/saturn-space.svg",
  4: "/mascots/smiling-sun.svg",
};

const UserSettingsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  // const apiService = useApi();
  const [isAuthChecked, setIsAuthChecked] = React.useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [showMascotModal, setShowMascotModal] = React.useState<boolean>(false);
  const [currentMascotId, setCurrentMascotId] = React.useState<number | null>(null);
  const [initialValues, setInitialValues] = React.useState<EditProfileFormValues>({
    username: DEFAULT_EDIT_PROFILE_USER.username,
    bio: DEFAULT_EDIT_PROFILE_USER.bio,
    mascot_id: DEFAULT_EDIT_PROFILE_USER.mascot_id,
    newPassword: "",
  });
  const [formValues, setFormValues] = React.useState<EditProfileFormValues>(
    initialValues,
  );

  const routeUserId = Array.isArray(params.id) ? params.id[0] : params.id;
  const selectedMascotImage = MASCOT_IMAGES[formValues.mascot_id] ?? MASCOT_IMAGES[1];
  const navProfileImage = currentUserId && currentMascotId
    ? MASCOT_IMAGES[currentMascotId] ?? MASCOT_IMAGES[1]
    : null;

  React.useEffect(() => {
    const parsedRouteUserId = Number(routeUserId);

    if (!Number.isInteger(parsedRouteUserId) || parsedRouteUserId <= 0) {
      router.replace("/");
      return;
    }

    // Guard the page: only authenticated users (token + user ID stored in local storage) can proceed.
    const token = getStoredToken();
    // LATER REMOVE EVERYTHING AND: const storedCurrentUserId = getStoredCurrentUserId();
    const storedCurrentUserId = token === DEFAULT_EDIT_PROFILE_TOKEN
      ? DEFAULT_EDIT_PROFILE_USER.id
      : getStoredCurrentUserId();
    const storedCurrentMascotId = getStoredCurrentMascotId();

    if (!token || !storedCurrentUserId) {
      clearStoredAuth();
      router.replace(`/users/${parsedRouteUserId}`);
      return;
    }

    // Only allow opening the page for the currently logged-in user.
    if (parsedRouteUserId !== storedCurrentUserId) {
      router.replace(`/users/${storedCurrentUserId}`);
      return;
    }

    const loadUser = async () => {
      try {
        // const fetchedUser = await apiService.get<User>(`/users/${parsedRouteUserId}`);

        const profileUser = {
          ...DEFAULT_EDIT_PROFILE_USER, // LATER CHANGE TO ...fetchedUser,
          id: parsedRouteUserId,
        };

        const nextFormValues = {
          username: profileUser.username,
          bio: profileUser.bio,
          mascot_id: profileUser.mascot_id,
          newPassword: "",
        };

        setInitialValues(nextFormValues);
        setFormValues(nextFormValues);
        setCurrentUserId(storedCurrentUserId);
        setCurrentMascotId(storedCurrentMascotId);
        setIsAuthChecked(true);
      } catch (error) {
        const appError = error as ApplicationError;

        if (appError.status === 401) {
          clearStoredAuth();
          router.replace(`/users/${parsedRouteUserId}`);
          return;
        }

        if (appError.status === 404) {
          alert("User not found.");
          router.replace(`/users/${storedCurrentUserId}`);
          return;
        }

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Profile could not be loaded. Please try again.");
        }
      }
    };

    loadUser();
  }, [routeUserId, router]);

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

    if (formValues.mascot_id !== initialValues.mascot_id) {
      if (!MASCOT_IMAGES[formValues.mascot_id]) {
        setErrorMessage("Please select a valid mascot.");
        return;
      }

      payload.mascot_id = formValues.mascot_id;
    }

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
      // await apiService.put<void>(`/users/${currentUserId}`, payload, {
      //   Authorization: `Bearer ${token}`,
      // });

      const passwordWasChanged = Boolean(payload.newPassword);

      setInitialValues({
        ...formValues,
        bio: trimmedBio,
        newPassword: "",
      });
      setFormValues((previousValues) => ({
        ...previousValues,
        bio: trimmedBio,
        newPassword: "",
      }));

      if (payload.mascot_id) {
        setStoredCurrentMascotId(payload.mascot_id);
        setCurrentMascotId(payload.mascot_id);
      }

      if (passwordWasChanged) {
        clearStoredAuth();
        alert("Password changed successfully. Please log in again.");
        router.replace("/login");
        return;
      }

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
            {navProfileImage
              ? (
                <img
                  src={navProfileImage}
                  alt="Your mascot"
                  className="profile-nav-avatar-image"
                />
              )
              : <UserCircle className="profile-nav-avatar-icon" />}
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
              <button
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
              </button>
              <p className="edit-profile-avatar-hint">Click to change picture</p>
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

      {showMascotModal && (
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
      )}

      <footer className="login-page-footer profile-page-footer">
        <div className="login-page-footer-content">
          <div className="login-page-footer-text">&copy; 2026 SoPra Group 13</div>
        </div>
      </footer>
    </div>
  );
};

export default UserSettingsPage;
