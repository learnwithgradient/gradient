import React from "react";
import InfoCard from "../components/InfoCard";

function HomePage({ dealIndex }) {
  return (
    <InfoCard
      screenClassName="home-screen"
      cardClassName="home-card"
      ariaLabel="Homepage intro"
      dealIndex={dealIndex}
    >
      <h1 className="home-title">
        <span className="home-title-top">Welcome to</span>
        <span className="home-title-main">Gradient.</span>
      </h1>
      <p className="home-subtitle">
        Machine Learning made visual.<br />Inspired By Scratch And Khan Academy.
      </p>
    </InfoCard>
  );
}

export default HomePage;
