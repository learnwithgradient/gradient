import React from "react";
import InfoCard from "../components/InfoCard";

function InformationalCard({
  screenClassName = "",
  cardClassName = "",
  ariaLabel,
  dealIndex = null,
  eyebrow,
  title,
  body,
  bodyAs: BodyTag = "p",
  meta,
}) {
  return (
    <InfoCard
      screenClassName={screenClassName}
      cardClassName={["static-page-card", cardClassName].filter(Boolean).join(" ")}
      ariaLabel={ariaLabel}
      dealIndex={dealIndex}
    >
      <p className="static-page-eyebrow">{eyebrow}</p>
      <h1 className="static-page-title">{title}</h1>
      <BodyTag className="static-page-body">{body}</BodyTag>
      <ul className="static-page-meta">{meta}</ul>
    </InfoCard>
  );
}

export default InformationalCard;
