import React, { useEffect, useRef, useState } from "react";
import InfoCard from "../components/InfoCard";
import "./StaticPage.css";
import "./AccountPage.css";

const ACCOUNT_FLIP_MS = 980;

function AccountPage({ dealIndex = null }) {
  const [mode, setMode] = useState("login");
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState("forward");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loginSubmitted, setLoginSubmitted] = useState(false);
  const [signupSubmitted, setSignupSubmitted] = useState(false);
  const flipTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (flipTimerRef.current) {
        window.clearTimeout(flipTimerRef.current);
      }
    },
    []
  );

  const switchMode = (nextMode) => {
    if (nextMode === mode || isFlipping) {
      return;
    }

    if (flipTimerRef.current) {
      window.clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }

    setFlipDirection(nextMode === "signup" ? "forward" : "backward");
    setIsFlipping(true);
    setMode(nextMode);
    setLoginError("");
    setSignupError("");

    flipTimerRef.current = window.setTimeout(() => {
      setIsFlipping(false);
      flipTimerRef.current = null;
    }, ACCOUNT_FLIP_MS);
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Please fill in all fields.");
      return;
    }

    setLoginSubmitted(true);
  };

  const handleSignupSubmit = (event) => {
    event.preventDefault();
    setSignupError("");

    if (!signupEmail.trim() || !signupPassword || !signupConfirmPassword) {
      setSignupError("Please fill in all fields.");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords don't match.");
      return;
    }

    setSignupSubmitted(true);
  };

  const renderModeToggle = (isActiveFace) => (
    <div className="account-mode-toggle" role="group" aria-label="Authentication mode">
      <button
        type="button"
        className={`account-mode-btn${mode === "login" ? " is-active" : ""}`}
        aria-pressed={mode === "login"}
        disabled={isFlipping || !isActiveFace || mode === "login"}
        onClick={() => switchMode("login")}
      >
        Login
      </button>
      <button
        type="button"
        className={`account-mode-btn${mode === "signup" ? " is-active" : ""}`}
        aria-pressed={mode === "signup"}
        disabled={isFlipping || !isActiveFace || mode === "signup"}
        onClick={() => switchMode("signup")}
      >
        Sign up
      </button>
    </div>
  );

  const flipSceneClassName = [
    "account-flip-scene",
    isFlipping ? "is-flipping" : "",
    isFlipping && flipDirection === "forward" ? "is-flipping-forward" : "",
    isFlipping && flipDirection === "backward" ? "is-flipping-backward" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const flipCardClassName = [
    "account-flip-card",
    mode === "signup" ? "is-signup" : "",
    isFlipping ? "is-flipping" : "",
    isFlipping && flipDirection === "forward" ? "is-flipping-forward" : "",
    isFlipping && flipDirection === "backward" ? "is-flipping-backward" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <InfoCard
      screenClassName="account-screen"
      cardClassName="static-page-card account-page-card"
      ariaLabel="Account page"
      dealIndex={dealIndex}
    >
      <div className={flipSceneClassName}>
        <div className={flipCardClassName}>
          <section
            className="account-face account-face--login"
            aria-hidden={mode !== "login"}
          >
            <div className="account-face-header">
              <p className="static-page-eyebrow">Account</p>
              {renderModeToggle(mode === "login")}
            </div>

            <div className="account-face-body">
              {loginSubmitted ? (
                <div className="account-face-copy account-face-copy--success">
                  <h1 className="static-page-title account-face-title">Welcome back.</h1>
                  <p className="static-page-body account-face-description">
                    You&apos;ve logged in successfully.
                  </p>
                </div>
              ) : (
                <>
                  <div className="account-face-copy">
                    <h1 className="static-page-title account-face-title">Login</h1>
                    <p className="static-page-body account-face-description">
                      Pick up where you left off and get back to your saved lessons.
                    </p>
                  </div>

                  <form className="account-form" onSubmit={handleLoginSubmit} noValidate>
                    <div className="account-field">
                      <label className="account-label" htmlFor="account-login-email">
                        Email
                      </label>
                      <input
                        id="account-login-email"
                        type="email"
                        className="account-input"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={mode !== "login"}
                      />
                    </div>

                    <div className="account-field">
                      <label className="account-label" htmlFor="account-login-password">
                        Password
                      </label>
                      <input
                        id="account-login-password"
                        type="password"
                        className="account-input"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        disabled={mode !== "login"}
                      />
                    </div>

                    {loginError && (
                      <p className="account-error" role="alert">
                        {loginError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="account-submit"
                      disabled={mode !== "login"}
                    >
                      Login
                    </button>
                  </form>
                </>
              )}
            </div>
          </section>

          <section
            className="account-face account-face--signup"
            aria-hidden={mode !== "signup"}
          >
            <div className="account-face-header">
              <p className="static-page-eyebrow">Account</p>
              {renderModeToggle(mode === "signup")}
            </div>

            <div className="account-face-body">
              {signupSubmitted ? (
                <div className="account-face-copy account-face-copy--success">
                  <h1 className="static-page-title account-face-title">You&apos;re in.</h1>
                  <p className="static-page-body account-face-description">
                    Your account has been created. Start learning.
                  </p>
                </div>
              ) : (
                <>
                  <div className="account-face-copy">
                    <h1 className="static-page-title account-face-title">Sign Up</h1>
                    <p className="static-page-body account-face-description">
                      Create an account to save progress, favorites, and lesson paths.
                    </p>
                  </div>

                  <form className="account-form" onSubmit={handleSignupSubmit} noValidate>
                    <div className="account-field">
                      <label className="account-label" htmlFor="account-signup-email">
                        Email
                      </label>
                      <input
                        id="account-signup-email"
                        type="email"
                        className="account-input"
                        value={signupEmail}
                        onChange={(event) => setSignupEmail(event.target.value)}
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={mode !== "signup"}
                      />
                    </div>

                    <div className="account-field">
                      <label className="account-label" htmlFor="account-signup-password">
                        Password
                      </label>
                      <input
                        id="account-signup-password"
                        type="password"
                        className="account-input"
                        value={signupPassword}
                        onChange={(event) => setSignupPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        disabled={mode !== "signup"}
                      />
                    </div>

                    <div className="account-field">
                      <label className="account-label" htmlFor="account-signup-confirm">
                        Confirm password
                      </label>
                      <input
                        id="account-signup-confirm"
                        type="password"
                        className="account-input"
                        value={signupConfirmPassword}
                        onChange={(event) => setSignupConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        disabled={mode !== "signup"}
                      />
                    </div>

                    {signupError && (
                      <p className="account-error" role="alert">
                        {signupError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="account-submit"
                      disabled={mode !== "signup"}
                    >
                      Create account
                    </button>
                  </form>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </InfoCard>
  );
}

export default AccountPage;
