"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type LoginFormValues = {
  username: string;
  password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

const PASSWORD_REQUIREMENTS =
  "Password must be at least 8 characters and include uppercase, lowercase, and a number.";
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [values, setValues] = React.useState<LoginFormValues>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<LoginFormErrors>({});
  const [submitMessage, setSubmitMessage] = React.useState<string>("");

  const handleChange =
    (field: keyof LoginFormValues) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextValues = { ...values, [field]: event.target.value };
        setValues(nextValues);
        setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
        setSubmitMessage("");
      };

  const validateForm = (): LoginFormErrors => {
    const nextErrors: LoginFormErrors = {};

    if (!values.username.trim()) {
      nextErrors.username = "Please input your username!";
    }

    if (!values.password) {
      nextErrors.password = "Please input your password!";
    } else if (!PASSWORD_PATTERN.test(values.password)) {
      nextErrors.password = PASSWORD_REQUIREMENTS;
    }

    return nextErrors;
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // TODO: Replace the placeholder "setSubmitMessage" line below with the actual login API call.
    // Example continuation:
    // const response = await apiService.post<AuthResponse>("/users/login", values);
    // router.push(`/users/${response.id}`);

    setSubmitMessage("Frontend validation passed. Connect the login API here.");

  };

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

            <form className="login-form" onSubmit={handleLogin} noValidate>
              <label htmlFor="username" className="login-field-group">
                <span className="login-label">Username</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  className="login-input"
                  value={values.username}
                  onChange={handleChange("username")}
                  autoComplete="username"
                />
                {errors.username && (
                  <span className="login-field-error">{errors.username}</span>
                )}
              </label>

              <label htmlFor="password" className="login-field-group">
                <span className="login-label">Password</span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="login-input"
                  value={values.password}
                  onChange={handleChange("password")}
                  autoComplete="current-password"
                />
                <span className="login-field-hint">{PASSWORD_REQUIREMENTS}</span>
                {errors.password && (
                  <span className="login-field-error">{errors.password}</span>
                )}
              </label>

              <button type="submit" className="login-submit-button">
                <span>Sign In</span>
                <span className="login-submit-arrow" aria-hidden="true">→</span>
              </button>
            </form>

            {submitMessage && (
              <p className="login-submit-message">{submitMessage}</p>
            )}

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
