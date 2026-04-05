import React from "react";
import InfoCard from "../components/InfoCard";

function MissionPage({ dealIndex = null }) {
  return (
    <InfoCard
      screenClassName="mission-screen"
      cardClassName="static-page-card mission-page-card"
      ariaLabel="Mission page"
      dealIndex={dealIndex}
    >
      <p className="static-page-eyebrow">Mission</p>
      <h1 className="static-page-title">Why We Built <i>Gradient.</i></h1>
      <p className="static-page-body">
        
        There's a particular feeling that every student with a good teacher knows: the moment something clicks. Not because you read a textbook, watched a lecture, or took a test, but because you <i>experienced</i> it. You built your intuition. 

        Growing up, I found it in two places: Scratch and Khan Academy. To me, these were the first two truly consequential and influential tools in my life, they set the path for me to become who I am today. In the same way, I hope Gradient can be a tool that helps students find that feeling, and in doing so, truly understand what 'artificial intelligence' really is.
      
      </p>
      <ul className="static-page-meta">
        <li>Aryan Gupta</li>
      </ul>
    </InfoCard>
  );
}

export default MissionPage;
