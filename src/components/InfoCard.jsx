import React, { useMemo } from "react";

const DEAL_TILT_MIN_DEG = 1.2;
const DEAL_TILT_MAX_DEG = 3.4;
const DEAL_TILT_SPAN_DEG = DEAL_TILT_MAX_DEG - DEAL_TILT_MIN_DEG;

function resolveTiltSeed(dealIndex) {
  return Number.isFinite(dealIndex) ? Math.abs(dealIndex) + 1 : 1;
}

function createSeededUnit(seed) {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return raw - Math.floor(raw);
}

function generateCardTilt(dealIndex) {
  const seed = resolveTiltSeed(dealIndex);
  const direction = createSeededUnit(seed + 17) >= 0.5 ? 1 : -1;
  const magnitude = DEAL_TILT_MIN_DEG + createSeededUnit(seed) * DEAL_TILT_SPAN_DEG;

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
  const screenClassNames = ["info-card-screen", screenClassName]
    .filter(Boolean)
    .join(" ");
  const cardClassNames = ["info-card-shell", cardClassName]
    .filter(Boolean)
    .join(" ");
  const cardStyle = useInfoCardDealStyle(dealIndex);

  return (
    <main className={screenClassNames} aria-live="polite">
      <section className={cardClassNames} role={role} aria-label={ariaLabel} style={cardStyle}>
        {children}
      </section>
    </main>
  );
}

export default InfoCard;
