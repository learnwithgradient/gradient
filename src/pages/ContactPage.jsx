import React from "react";
import InfoCard from "../components/InfoCard";
import "./StaticPage.css";
import "./ContactPage.css";

function ContactPage({ dealIndex = null }) {
  return (
    <InfoCard
      screenClassName="contact-screen"
      cardClassName="static-page-card contact-page-card"
      ariaLabel="Contact page"
      dealIndex={dealIndex}
    >
      <p className="static-page-eyebrow">Contact</p>
      <h1 className="static-page-title">Get In Touch</h1>
      <p className="static-page-body">
        We’d love to hear from you! Whether you have questions about our
        courses, comments about the platform, or just want to say hi, feel free
        to reach out.
      </p>
      <ul className="static-page-meta">
        <li className="contact-page-inline-links">
          <a href="mailto:aryan.cs.app@gmail.com">
            aryan.cs.app [at] gmail [dot] com
          </a>{" "}
          //{" "}
          <a
            href="https://x.com/aryanguptacs"
            target="_blank"
            rel="noopener noreferrer"
          >
            @aryanguptacs
          </a>{" "}
          on X
        </li>
        <li className="contact-page-inline-links">
          <a href="mailto:yaxpatel2004@gmail.com">
            yaxpatel2004 [at] gmail [dot] com
          </a>{" "}
          //{" "}
          <a
            href="https://x.com/yaxpatel_"
            target="_blank"
            rel="noopener noreferrer"
          >
            @yaxpatel_
          </a>{" "}
          on X
        </li>
        <li>
          Notice anything wrong? Open an issue on{" "}
          <a
            href="https://github.com/aryan-cs/gradient/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub.
          </a>
        </li>
      </ul>
    </InfoCard>
  );
}

export default ContactPage;
