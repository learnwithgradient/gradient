import React from "react";
import InformationalCard from "./InformationalCard";

function MissionPage({ dealIndex = null }) {
  return (
    <InformationalCard
      screenClassName="mission-screen"
      cardClassName="mission-page-card"
      ariaLabel="Mission page"
      dealIndex={dealIndex}
      eyebrow="Mission"
      title={
        <>
          Why We Built <i>Gradient.</i>
        </>
      }
      body={
        <>
          I haven't yet found words that adequately capture my motivations or vision for Gradient,
          so this page will come soon. I will say, though, both machine learning and teaching are
          things that I feel are fundamental to who I am.
        </>
      }
      meta={<li>Aryan Gupta</li>}
    />
  );
}

export default MissionPage;
