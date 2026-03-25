import React from "react";
import InfoCard from "../components/InfoCard";
import "./PageNotFound.css";

function PageNotFound({ isComingSoon = false, dealIndex = null }) {
  const statusCode = isComingSoon ? "501" : "404";
  const caption = isComingSoon
    ? "This Page Is Coming Soon!"
    : "This Page Doesn't Exist!";

  return (
    <InfoCard
      screenClassName="not-found-screen"
      cardClassName="not-found-card"
      role="status"
      ariaLabel="Page status"
      dealIndex={dealIndex}
    >
      <h1 className="not-found-code">{statusCode}</h1>
      <p className="not-found-caption">{caption}</p>
    </InfoCard>
  );
}

export default PageNotFound;
