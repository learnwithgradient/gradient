"use client";
import React, { useMemo } from "react";
import "./InfoCard.css";

const DEAL_TILT_MIN_DEG = 1.2;
const DEAL_TILT_MAX_DEG = 3.4;
const DEAL_TILT_MIN_DELTA_DEG = 0.45;
const RECENT_TILT_WINDOW = 5;
const recentTiltMagnitudes = [];

function sampleTiltMagnitude() {
  return (
    DEAL_TILT_MIN_DEG + Math.random() * (DEAL_TILT_MAX_DEG - DEAL_TILT_MIN_DEG)
  );
}

function generateCardTilt(dealIndex) {
  const direction = Number.isFinite(dealIndex)
    ? dealIndex % 2 === 0
      ? -1
      : 1
    : Math.random() < 0.5
      ? -1
      : 1;
  let magnitude = sampleTiltMagnitude();
  let attempt = 0;

  while (attempt < 12) {
    const isTooCloseToRecent = recentTiltMagnitudes.some(
      (recentMagnitude) =>
        Math.abs(recentMagnitude - magnitude) < DEAL_TILT_MIN_DELTA_DEG,
    );
    if (!isTooCloseToRecent) {
      break;
    }
    magnitude = sampleTiltMagnitude();
    attempt += 1;
  }

  recentTiltMagnitudes.push(magnitude);
  if (recentTiltMagnitudes.length > RECENT_TILT_WINDOW) {
    recentTiltMagnitudes.shift();
  }

  const tilt = magnitude * direction;
  return tilt.toFixed(2);
}

function InfoCard({
  screenClassName = "",
  cardClassName = "",
  role = "region",
  ariaLabel,
  dealIndex = null,
  children,
}) {
  const screenClassNames = ["info-card-screen", screenClassName]
    .filter(Boolean)
    .join(" ");
  const cardClassNames = ["info-card-shell", cardClassName]
    .filter(Boolean)
    .join(" ");
  const cardTilt = useMemo(() => generateCardTilt(dealIndex), [dealIndex]);
  const cardStyle = {
    "--info-card-deal-tilt": `${cardTilt}deg`,
  } as React.CSSProperties;

  return (
    <main className={screenClassNames} aria-live="polite">
      <section
        className={cardClassNames}
        role={role}
        aria-label={ariaLabel}
        style={cardStyle}
      >
        {children}
      </section>
    </main>
  );
}

export default InfoCard;
