"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Button, Form, Input } from "antd";
import { useApi } from "@/hooks/useApi";
import { ApplicationError } from "@/types/error";
import { ChangePasswordRequest } from "@/types/user";
import {
  clearStoredAuth,
  getStoredCurrentUserId,
  getStoredToken,
} from "@/utils/auth";

interface ChangePasswordFormValues {
  newPassword: string;
  confirmNewPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const apiService = useApi();
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [isAuthChecked, setIsAuthChecked] = React.useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const routeUserId = Array.isArray(params.id) ? params.id[0] : params.id;

  React.useEffect(() => {
    // Guard the page: only authenticated users (token + user ID stored in local storage) can proceed.
    const token = getStoredToken();
    const storedCurrentUserId = getStoredCurrentUserId();

    if (!token || !storedCurrentUserId) {
      clearStoredAuth();
      router.replace("/");
      return;
    }

    const parsedRouteUserId = Number(routeUserId);
    if (!Number.isInteger(parsedRouteUserId) || parsedRouteUserId <= 0) {
      router.replace("/users");
      return;
    }

    // Only allow opening the page for the currently logged-in user.
    // A logged-in user cannot go the /password page of another user.
    if (parsedRouteUserId !== storedCurrentUserId) {
      router.replace(`/users/${storedCurrentUserId}`);
      return;
    }

    setCurrentUserId(storedCurrentUserId);
    setIsAuthChecked(true);
  }, [routeUserId, router]);

  const handleChangePassword = async (
    values: ChangePasswordFormValues,
  ): Promise<void> => {
    const token = getStoredToken();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // Backend contract for PUT /users/{userId}.
      const payload: ChangePasswordRequest = {
        newPassword: values.newPassword,
      };

      await apiService.put<void>(`/users/${currentUserId}`, payload, {
        Authorization: `Bearer ${token}`,
      });

      // Backend clears the token; clear local auth and force fresh login.
      clearStoredAuth();
      // The user must acknowledge the success before being redirected.
      alert("Password changed successfully. Please log in again.");
      router.replace("/login");
    } catch (error) {
      const appError = error as ApplicationError;

      // 401 includes invalid token or attempting to change another user's password.
      if (appError.status === 401) {
        clearStoredAuth();
        router.replace("/login");
        return;
      }

      if (appError.status === 404) {
        alert("User not found.");
        router.replace("/users");
        return;
      }

      if (appError.status === 400) {
        setErrorMessage(
          "Password must not be blank and must contain at least 8 characters.",
        );
        return;
      }

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Password change failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthChecked) {
    return null;
  }

  return (
    <div className="login-container">
      <Form
        form={form}
        name="changePassword"
        size="large"
        variant="outlined"
        onFinish={handleChangePassword}
        layout="vertical"
      >
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Please input your new password!" },
            { min: 8, message: "Password must be at least 8 characters." },
          ]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          name="confirmNewPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]}
          rules={[
            {
              required: true,
              message: "Please confirm your new password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                // Ensure both password inputs match before sending request.
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error("The two passwords do not match."),
                );
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>

        {errorMessage && (
          <Form.Item>
            <Alert type="error" showIcon message={errorMessage} />
          </Form.Item>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="auth-button"
            loading={isSubmitting}
          >
            Change Password
          </Button>
        </Form.Item>

        <Form.Item>
          <Button
            type="default"
            className="auth-button"
            onClick={() => router.push(`/users/${currentUserId}`)}
          >
            Back to Profile
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePasswordPage;
