"use client";

// UNCOMMENT ALL LINES TO ACTIVATE REGISTER LOGIC
// import { useApi } from "@/hooks/useApi";
// import useLocalStorage from "@/hooks/useLocalStorage";
import useRedirectIfAuthenticated from "@/hooks/useRedirectIfAuthenticated";
import type { ApplicationError } from "@/types/error";
import type { RegisterRequest } from "@/types/user";
// import type { User } from "@/types/user";
// import { setStoredCurrentUserId } from "@/utils/auth";
import { Alert, ConfigProvider, Form, Input } from "antd";
import { ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  // const apiService = useApi();
  const [form] = Form.useForm<RegisterRequest>();
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const isAuthChecked = useRedirectIfAuthenticated();
  // const { set: setToken } = useLocalStorage<string>("token", "");

  const handleRegister = async (values: RegisterRequest) => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // const response = await apiService.post<User>("/users", {
      //   ...values,
      //   bio: values.bio?.trim() ?? "",
      // });

      // if (response.token) {
      //   setToken(response.token);
      //   setStoredCurrentUserId(response.id);
      // }
      // router.push(`/users/${response.id}`);
    } catch (error) {
      const appError = error as ApplicationError;

      if (appError.status === 409) {
        setErrorMessage("This username is already taken.");
      } else if (appError.status === 400) {
        setErrorMessage("Please check your input and try again.");
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthChecked) {
    return null;
  }

  return (
    <div className="login-page-shell">
      <div className="login-page-background" />

      <nav className="login-page-nav">
        <div className="login-page-nav-left">
          <Link href="/" className="login-page-brand">
            <div className="login-page-brand-icon" aria-hidden="true">
              G
            </div>
            <span className="login-page-brand-text">GeoGuess</span>
          </Link>
        </div>

        <div className="login-page-nav-right">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="login-page-close-button"
            aria-label="Close register page"
          >
            ×
          </button>
        </div>
        <div className="login-page-nav-divider" />
      </nav>

      <main className="login-page-main">
        <div className="register-card">
          <div className="register-card-glow register-card-glow-top" />
          <div className="register-card-glow register-card-glow-bottom" />

          <div className="login-card-content">
            <div className="register-icon-badge" aria-hidden="true">
              <UserPlus size={28} strokeWidth={2.25} />
            </div>

            <h2 className="login-title">Create Account</h2>
            <p className="login-subtitle">
              Join the world&apos;s best geography guessing community.
            </p>

            <ConfigProvider
              theme={{
                token: {
                  colorBgContainer: "rgba(255, 255, 255, 0.5)",
                  colorText: "#1e293b",
                  colorTextPlaceholder: "#94a3b8",
                  colorBorder: "#e2e8f0",
                  colorPrimary: "#818cf8",
                  borderRadius: 12,
                  controlHeightLG: 50,
                  fontSizeLG: 16,
                },
              }}
            >
              <Form
                form={form}
                className="login-form"
                name="register"
                onFinish={handleRegister}
                requiredMark={false}
              >
                <div className="login-field-group">
                  <label htmlFor="username" className="login-label">
                    Username
                  </label>
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: "Please input your username!" }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      id="username"
                      size="large"
                      placeholder="Choose a username"
                      autoComplete="username"
                    />
                  </Form.Item>
                </div>

                <div className="login-field-group">
                  <label htmlFor="password" className="login-label">
                    Password
                  </label>
                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: "Please input your password!" },
                      { min: 8, message: "Password must be at least 8 characters." },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input.Password
                      id="password"
                      size="large"
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                    />
                  </Form.Item>
                </div>

                <div className="login-field-group">
                  <label htmlFor="bio" className="login-label">
                    Bio (optional)
                  </label>
                  <Form.Item
                    name="bio"
                    style={{ marginBottom: 0 }}
                  >
                    <Input.TextArea
                      id="bio"
                      placeholder="Tell us something about yourself"
                      autoComplete="off"
                      rows={3}
                    />
                  </Form.Item>
                </div>

                {errorMessage && (
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Alert type="error" showIcon message={errorMessage} />
                  </Form.Item>
                )}

                <button
                  type="submit"
                  className="register-submit-button"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Registering..." : "Register"}</span>
                  <ArrowRight className="register-submit-arrow" size={20} />
                </button>
              </Form>
            </ConfigProvider>

            <p className="login-register-text">
              Already have an account?{" "}
              <Link href="/login" className="login-register-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="login-page-footer">
        <div className="login-page-footer-content">
          <div className="login-page-footer-text">&copy; 2026 SoPra Group 13</div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;
