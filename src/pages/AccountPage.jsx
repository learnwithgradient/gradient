import React, { useEffect, useRef, useState } from "react";
import "../components/InfoCard.css";
import { useInfoCardDealStyle } from "../components/InfoCard";
import "./StaticPage.css";
import "./AccountPage.css";

const ORBIT_DURATION_MS = 880;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const smootherStep = (value) => value * value * value * (value * (value * 6 - 15) + 10);

const setMotionVariables = (sceneEl, orbitEl, cardEl, direction, progress) => {
  if (!sceneEl || !orbitEl || !cardEl) {
    return;
  }

  const directionSign = direction === "forward" ? 1 : -1;
  const eased = smootherStep(progress);
  const theta = Math.PI * eased;
  const arc = Math.sin(theta);
  const rotateProgress = smootherStep(progress);
  const rotateY = direction === "forward" ? 180 * rotateProgress : 180 * (1 - rotateProgress);

  const orbitX = 0.46 * directionSign * arc * (0.84 + 0.16 * Math.cos(theta * 0.5));
  const orbitY = -1.56 * arc;
  const orbitZ = 112 * Math.pow(arc, 1.08);
  const orbitTilt = 9.8 * arc;
  const orbitRoll = -1.05 * directionSign * arc * (0.88 - 0.16 * eased);

  const shadowLift = 0.2 * arc;
  const shadowX = 0.13 * directionSign * arc * (0.8 - 0.22 * eased);
  const shadowY = 0.18 + 0.72 * arc;
  const shadowScale = 0.88 + 0.32 * arc;
  const shadowBlur = 9 + 8.2 * arc;
  const shadowOpacity = 0.34 - shadowLift;

  orbitEl.style.setProperty("--account-orbit-x", `${orbitX.toFixed(4)}rem`);
  orbitEl.style.setProperty("--account-orbit-y", `${orbitY.toFixed(4)}rem`);
  orbitEl.style.setProperty("--account-orbit-z", `${orbitZ.toFixed(4)}px`);
  orbitEl.style.setProperty("--account-orbit-tilt-x", `${orbitTilt.toFixed(4)}deg`);
  orbitEl.style.setProperty("--account-orbit-roll", `${orbitRoll.toFixed(4)}deg`);
  sceneEl.style.setProperty("--account-shadow-x", `${shadowX.toFixed(4)}rem`);
  sceneEl.style.setProperty("--account-shadow-y", `${shadowY.toFixed(4)}rem`);
  sceneEl.style.setProperty("--account-shadow-scale", shadowScale.toFixed(4));
  sceneEl.style.setProperty("--account-shadow-blur", `${shadowBlur.toFixed(4)}px`);
  sceneEl.style.setProperty("--account-shadow-opacity", shadowOpacity.toFixed(4));
  cardEl.style.setProperty("--account-card-rotate-y", `${rotateY.toFixed(4)}deg`);
};

const clearMotionVariables = (sceneEl, orbitEl, cardEl, finalMode = null) => {
  if (!sceneEl || !orbitEl || !cardEl) {
    return;
  }

  orbitEl.style.removeProperty("--account-orbit-x");
  orbitEl.style.removeProperty("--account-orbit-y");
  orbitEl.style.removeProperty("--account-orbit-z");
  orbitEl.style.removeProperty("--account-orbit-tilt-x");
  orbitEl.style.removeProperty("--account-orbit-roll");
  sceneEl.style.removeProperty("--account-shadow-x");
  sceneEl.style.removeProperty("--account-shadow-y");
  sceneEl.style.removeProperty("--account-shadow-scale");
  sceneEl.style.removeProperty("--account-shadow-blur");
  sceneEl.style.removeProperty("--account-shadow-opacity");

  if (finalMode === "signup") {
    cardEl.style.setProperty("--account-card-rotate-y", "180deg");
    return;
  }

  if (finalMode === "login") {
    cardEl.style.setProperty("--account-card-rotate-y", "0deg");
    return;
  }

  cardEl.style.removeProperty("--account-card-rotate-y");
};

function AccountPage({ dealIndex = null }) {
  const [mode, setMode] = useState("login");
  const [pendingMode, setPendingMode] = useState(null);
  const [orbitDirection, setOrbitDirection] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loginSubmitted, setLoginSubmitted] = useState(false);
  const [signupSubmitted, setSignupSubmitted] = useState(false);
  const sceneRef = useRef(null);
  const orbitRef = useRef(null);
  const cardRef = useRef(null);
  const animationFrameRef = useRef(0);
  const animationStartRef = useRef(0);

  const isOrbiting = orbitDirection !== null;
  const selectedMode = pendingMode ?? mode;
  const isCardFlipped = selectedMode !== "login";
  const dealStyle = useInfoCardDealStyle(dealIndex);

  useEffect(() => {
    if (!orbitDirection || !pendingMode) {
      return undefined;
    }

    const sceneEl = sceneRef.current;
    const orbitEl = orbitRef.current;
    const cardEl = cardRef.current;

    if (!sceneEl || !orbitEl || !cardEl) {
      return undefined;
    }

    animationStartRef.current = 0;

    const step = (timestamp) => {
      if (!animationStartRef.current) {
        animationStartRef.current = timestamp;
      }

      const progress = clamp((timestamp - animationStartRef.current) / ORBIT_DURATION_MS, 0, 1);
      setMotionVariables(sceneEl, orbitEl, cardEl, orbitDirection, progress);

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(step);
        return;
      }

      setMode(pendingMode);
      setPendingMode(null);
      setOrbitDirection(null);
      clearMotionVariables(sceneEl, orbitEl, cardEl, pendingMode);
    };

    animationFrameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
    };
  }, [orbitDirection, pendingMode]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const switchMode = (nextMode) => {
    if (nextMode === mode || isOrbiting) {
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setMode(nextMode);
      setPendingMode(null);
      setLoginError("");
      setSignupError("");
      return;
    }

    const direction = nextMode === "signup" ? "forward" : "backward";
    setMotionVariables(sceneRef.current, orbitRef.current, cardRef.current, direction, 0);
    setPendingMode(nextMode);
    setOrbitDirection(direction);
    setLoginError("");
    setSignupError("");
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

  const renderModeSwitch = (activeMode) => {
    const isLoginFace = activeMode === "login";
    const nextMode = isLoginFace ? "signup" : "login";
    const switchCopy = isLoginFace
      ? "New here? Create an account"
      : "Been here before? Login";

    return (
      <button
        type="button"
        className="account-mode-switch"
        disabled={isOrbiting}
        onClick={() => switchMode(nextMode)}
      >
        {switchCopy}
      </button>
    );
  };

  return (
    <main className="info-card-screen account-screen" aria-live="polite">
      <div
        ref={sceneRef}
        className={`account-flip-scene${isOrbiting ? " is-orbiting" : ""}`}
        style={dealStyle}
      >
        <div ref={orbitRef} className="account-flip-orbit">
          <div
            ref={cardRef}
            className={`account-flip-card${isCardFlipped ? " is-flipped" : ""}`}
          >
            {/* ── Front face: Login ── */}
            <section
              className="account-flip-face account-flip-front info-card-shell static-page-card account-page-card"
              role="region"
              aria-label="Login"
            >
              <div className="account-panel">
                <div className="account-panel-header">
                  <p className="static-page-eyebrow">Account</p>
                  {renderModeSwitch("login")}
                </div>

                <div className="account-panel-body">
                  <div className={`account-copy${loginSubmitted ? " account-copy--success" : ""}`}>
                    <h1 className="static-page-title account-title">
                      {loginSubmitted ? "Welcome back." : "Login"}
                    </h1>
                    <p className="static-page-body account-description">
                      {loginSubmitted
                        ? "You've logged in successfully."
                        : "Pick up where you left off and get back to your saved lessons."}
                    </p>
                  </div>

                  {!loginSubmitted ? (
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
                        />
                      </div>

                      {loginError && (
                        <p className="account-error" role="alert">
                          {loginError}
                        </p>
                      )}

                      <button type="submit" className="account-submit">
                        Login
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </section>

            {/* ── Back face: Sign Up ── */}
            <section
              className="account-flip-face account-flip-back info-card-shell static-page-card account-page-card"
              role="region"
              aria-label="Sign up"
            >
              <div className="account-panel">
                <div className="account-panel-header">
                  <p className="static-page-eyebrow">Account</p>
                  {renderModeSwitch("signup")}
                </div>

                <div className="account-panel-body">
                  <div className={`account-copy${signupSubmitted ? " account-copy--success" : ""}`}>
                    <h1 className="static-page-title account-title">
                      {signupSubmitted ? "You're in." : "Sign Up"}
                    </h1>
                    <p className="static-page-body account-description">
                      {signupSubmitted
                        ? "Your account has been created. Start learning."
                        : "Create an account to save progress, favorites, and lesson paths."}
                    </p>
                  </div>

                  {!signupSubmitted ? (
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
                        />
                      </div>

                      {signupError && (
                        <p className="account-error" role="alert">
                          {signupError}
                        </p>
                      )}

                      <button type="submit" className="account-submit">
                        Create account
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AccountPage;
