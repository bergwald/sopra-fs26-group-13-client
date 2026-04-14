"use client";

// UNCOMMENT ALL LINES TO ACTIVATE LOGIN LOGIC
// import { useApi } from "@/hooks/useApi";
// import useLocalStorage from "@/hooks/useLocalStorage";
import useRedirectIfAuthenticated from "@/hooks/useRedirectIfAuthenticated";
import type { ApplicationError } from "@/types/error";
import type { LoginRequest } from "@/types/user";
// import type { User } from "@/types/user";
// import { setStoredCurrentUserId } from "@/utils/auth";
import { ConfigProvider, Form, Input } from "antd";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const LoginPage: React.FC = () => {
  const router = useRouter();
  // const apiService = useApi();
  const [form] = Form.useForm<LoginRequest>();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const isAuthChecked = useRedirectIfAuthenticated("/");
  // const { set: setToken } = useLocalStorage<string>("token", "");

  const handleLogin = async (loginValues: LoginRequest) => {
    setIsSubmitting(true);

    try {
      // const response = await apiService.post<User>("/login", loginValues);

      // if (response.token && response.id) {
      //   setToken(response.token);
      //   setStoredCurrentUserId(response.id);
      // }

      // router.push("/users/{response.id}");
    } catch (error) {
      const appError = error as ApplicationError;

      if (appError.status === 401) {
        alert("Invalid username or password.");
      } else if (error instanceof Error) {
        alert(`Something went wrong during the login:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
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
            aria-label="Close login page"
          >
            ×
          </button>
        </div>
        <div className="login-page-nav-divider" />
      </nav>

      <main className="login-page-main">
        <div className="login-card">
          <div className="login-card-glow login-card-glow-top" />
          <div className="login-card-glow login-card-glow-bottom" />

          <div className="login-card-content">
            <div className="login-icon-badge" aria-hidden="true">
              <LogIn size={28} strokeWidth={2.25} />
            </div>
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">
              Login to track your ELO and play with friends.
            </p>

            <ConfigProvider
              theme={{
                token: {
                  colorBgContainer: "rgba(255, 255, 255, 0.5)",
                  colorText: "#1e293b",
                  colorTextPlaceholder: "#94a3b8",
                  colorBorder: "#e2e8f0",
                  colorPrimary: "#60a5fa",
                  borderRadius: 12,
                  controlHeightLG: 50,
                  fontSizeLG: 16,
                },
              }}
            >
              <Form
                form={form}
                className="login-form"
                name="login"
                onFinish={handleLogin}
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
                      placeholder="Enter your username"
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
                    rules={[{ required: true, message: "Please input your password!" }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input.Password
                      id="password"
                      size="large"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                  </Form.Item>
                </div>

                <button
                  type="submit"
                  className="login-submit-button"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
                  <span className="login-submit-arrow" aria-hidden="true">→</span>
                </button>
              </Form>
            </ConfigProvider>

            <p className="login-register-text">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="login-register-link">
                Register here
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

export default LoginPage;
