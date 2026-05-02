import React from "react";
import InformationalCard from "./InformationalCard";

function ContactPage({ dealIndex = null }) {
  return (
    <InformationalCard
      screenClassName="contact-screen"
      cardClassName="contact-page-card"
      ariaLabel="Contact page"
      dealIndex={dealIndex}
      eyebrow="Contact"
      title="Get In Touch"
      body={
        <>
        We’d love to hear from you! Whether you have questions about our courses, comments about the platform, or just want to say hi, feel free to reach out.
        </>
      }
      meta={
        <>
        <li className="contact-page-inline-links">
          <a
            className="contact-page-contact-link"
            href="mailto:aryan.cs.app@gmail.com"
          >
            aryan.cs.app [at] gmail [dot] com
          </a>
          <span className="contact-page-divider" aria-hidden="true">
            //
          </span>
          <a
            className="contact-page-contact-link"
            href="https://x.com/aryanguptacs"
            target="_blank"
            rel="noopener noreferrer"
          >
            @aryanguptacs on X
          </a>
        </li>
        <li>
          Notice anything wrong? Open an issue on{" "}
          <a href="https://github.com/aryan-cs/gradient/issues" target="_blank" rel="noopener noreferrer">
            GitHub.
          </a>
        </li>
        </>
      }
    />
  );
}

export default ContactPage;
