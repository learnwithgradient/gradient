import React from "react";
import InformationalCard from "./InformationalCard";

function DonatePage({ dealIndex = null }) {
  return (
    <InformationalCard
      screenClassName="donate-screen"
      cardClassName="donate-page-card"
      ariaLabel="Donate page"
      dealIndex={dealIndex}
      eyebrow="Donate"
      title={
        <>
          Support <i>Gradient.</i>
        </>
      }
      body={
        <>
        Thank you for considering a donation to Gradient!
        Right now, this is just a passion project of mine, so there's no need to worry about
        financials. However, if you do want to help people, I recommend donating to organizations
        like{" "}
        <a href="https://www.khanacademy.org" target="_blank" rel="noopener noreferrer">
          Khan Academy
        </a>
        ,{" "}
        <a href="https://www.stjude.org" target="_blank" rel="noopener noreferrer">
          St. Jude Children's Research Hospital
        </a>
        , or{" "}
        <a href="https://www.unbound.org" target="_blank" rel="noopener noreferrer">
          Unbound
        </a>
        .
        </>
      }
      meta={
        <>
        <li>"The more that you read, the more things you will know. </li>
        <li>The more that you learn, the more places you'll go." </li>
        <li>Dr. Seuss</li>
        </>
      }
    />
  );
}

export default DonatePage;
