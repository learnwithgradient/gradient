import React, { useEffect, useMemo, useState } from "react";

const FULLSCREEN_IGNORE_SELECTOR =
  "a, button, input, textarea, select, label, iframe, video, audio, [role='button'], [contenteditable='true']";
const FULLSCREEN_ANIMATION_MS = 720;

const DEAL_TILT_MIN_DEG = 1.6;
const DEAL_TILT_MAX_DEG = 3.9;
const DEAL_TILT_SEQUENCE_DEG = [3.45, 2.45, 1.95, 3.7, 2.9, 2.15, 3.2, 2.6];
const DEAL_TILT_CYCLE_ADJUSTMENTS_DEG = [-0.1, 0.09, -0.05];

function clampTiltMagnitude(value) {
  return Math.min(DEAL_TILT_MAX_DEG, Math.max(DEAL_TILT_MIN_DEG, value));
}

function resolveTiltIndex(dealIndex) {
  if (!Number.isFinite(dealIndex)) {
    return 0;
  }

  return Math.max(0, Math.abs(Math.trunc(dealIndex)));
}

function generateCardTilt(dealIndex) {
  const tiltIndex = resolveTiltIndex(dealIndex);
  const direction = tiltIndex % 2 === 0 ? -1 : 1;
  const baseMagnitude = DEAL_TILT_SEQUENCE_DEG[tiltIndex % DEAL_TILT_SEQUENCE_DEG.length];
  const cycleAdjustment =
    DEAL_TILT_CYCLE_ADJUSTMENTS_DEG[
      Math.floor(tiltIndex / DEAL_TILT_SEQUENCE_DEG.length) %
        DEAL_TILT_CYCLE_ADJUSTMENTS_DEG.length
    ];
  const magnitude = clampTiltMagnitude(baseMagnitude + cycleAdjustment);

  return (magnitude * direction).toFixed(2);
}

export function useInfoCardDealStyle(dealIndex = null) {
  const cardTilt = useMemo(() => generateCardTilt(dealIndex), [dealIndex]);

  return useMemo(
    () => ({
      "--info-card-deal-tilt": `${cardTilt}deg`,
    }),
    [cardTilt]
  );
}

function InfoCard({
  screenClassName = "",
  cardClassName = "",
  role = "region",
  ariaLabel,
  dealIndex = null,
  children,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenMotion, setFullscreenMotion] = useState(null);
  const [hasEntered, setHasEntered] = useState(false);
  const screenClassNames = [
    "info-card-screen",
    screenClassName,
    isFullscreen ? "is-card-fullscreen" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const cardClassNames = [
    "info-card-shell",
    cardClassName,
    hasEntered ? "has-entered" : "",
    isFullscreen ? "is-card-fullscreen" : "",
    fullscreenMotion ? `is-${fullscreenMotion}-fullscreen` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const cardStyle = useInfoCardDealStyle(dealIndex);

  useEffect(() => {
    const entryTimeoutId = window.setTimeout(() => {
      setHasEntered(true);
    }, 820);

    return () => {
      window.clearTimeout(entryTimeoutId);
    };
  }, []);

  useEffect(() => {
    if (!fullscreenMotion) {
      return undefined;
    }

    const motionTimeoutId = window.setTimeout(() => {
      setFullscreenMotion(null);
    }, FULLSCREEN_ANIMATION_MS);

    return () => {
      window.clearTimeout(motionTimeoutId);
    };
  }, [fullscreenMotion]);

  const enterFullscreen = () => {
    setHasEntered(true);
    setIsFullscreen(true);
    setFullscreenMotion("entering");
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenMotion("exiting");
  };

  const handleCardDoubleClick = (event) => {
    if (event.target.closest(FULLSCREEN_IGNORE_SELECTOR)) {
      return;
    }

    if (isFullscreen) {
      exitFullscreen();
      return;
    }

    enterFullscreen();
  };

  useEffect(() => {
    if (!isFullscreen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  return (
    <main className={screenClassNames} aria-live="polite">
      <section
        className={cardClassNames}
        role={role}
        aria-label={ariaLabel}
        style={cardStyle}
        onDoubleClick={handleCardDoubleClick}
      >
        {children}
      </section>
    </main>
  );
}

export default InfoCard;
