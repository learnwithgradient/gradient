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
          There's a particular feeling that every student with a good teacher knows: the moment
          something clicks. Not because you read a textbook, watched a lecture, or took a test,
          but because you <i>experienced</i> it. You built your intuition.
          <br />
          <br />
          Growing up, I found it in two places: Scratch and Khan Academy. To me, these were the
          first two truly consequential and influential tools in my life, they set the path for me
          to become who I am today. In the same way, I hope Gradient can be a tool that helps
          students find that feeling, and in doing so, truly understand what "artificial
          intelligence" really is.
        </>
      }
      meta={<li>Aryan Gupta</li>}
    />
  );
}

export default MissionPage;
