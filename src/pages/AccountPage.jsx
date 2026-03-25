import React, { useState } from "react";
import InfoCard from "../components/InfoCard";
import "./StaticPage.css";
import "./AccountPage.css";

function AccountPage({ dealIndex = null }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setConfirmPassword("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <InfoCard
        screenClassName="account-screen"
        cardClassName="static-page-card account-page-card"
        ariaLabel="Account page"
        dealIndex={dealIndex}
      >
        <p className="static-page-eyebrow">Account</p>
        <h1 className="static-page-title">
          {mode === "signin" ? "Welcome back." : "You're in."}
        </h1>
        <p className="static-page-body">
          {mode === "signin"
            ? "You've signed in successfully."
            : "Your account has been created. Start learning."}
        </p>
      </InfoCard>
    );
  }

  return (
    <InfoCard
      screenClassName="account-screen"
      cardClassName="static-page-card account-page-card"
      ariaLabel="Account page"
      dealIndex={dealIndex}
    >
      <p className="static-page-eyebrow">Account</p>
      <h1 className="static-page-title">
        {mode === "signin" ? "Sign In" : "Sign Up"}
      </h1>

      <div
        className="account-mode-toggle"
        role="group"
        aria-label="Authentication mode"
      >
        <button
          type="button"
          className={`account-mode-btn${mode === "signin" ? " is-active" : ""}`}
          aria-pressed={mode === "signin"}
          onClick={() => switchMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`account-mode-btn${mode === "signup" ? " is-active" : ""}`}
          aria-pressed={mode === "signup"}
          onClick={() => switchMode("signup")}
        >
          Sign up
        </button>
      </div>

      <form className="account-form" onSubmit={handleSubmit} noValidate>
        <div className="account-field">
          <label className="account-label" htmlFor="account-email">
            Email
          </label>
          <input
            id="account-email"
            type="email"
            className="account-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="account-field">
          <label className="account-label" htmlFor="account-password">
            Password
          </label>
          <input
            id="account-password"
            type="password"
            className="account-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            placeholder="••••••••"
          />
        </div>

        {mode === "signup" && (
          <div className="account-field">
            <label className="account-label" htmlFor="account-confirm">
              Confirm password
            </label>
            <input
              id="account-confirm"
              type="password"
              className="account-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>
        )}

        {error && (
          <p className="account-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="account-submit">
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </InfoCard>
  );
}

export default AccountPage;
