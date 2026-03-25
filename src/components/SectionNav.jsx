"use client";
import React from "react";

function SectionNav({
  sections,
  activeSection,
  selectedSection,
  onSectionHover,
  onSectionBlur,
  onSectionClick,
}) {
  return (
    <nav className="projector-sections" aria-label="Learning sections">
      <ul onMouseLeave={onSectionBlur}>
        {sections.map((section) => {
          const isActive = activeSection === section;
          return (
            <li key={section}>
              <button
                type="button"
                className={`projector-section-trigger${isActive ? " is-active" : ""}`}
                onMouseEnter={() => onSectionHover(section)}
                onFocus={() => onSectionHover(section)}
                onBlur={onSectionBlur}
                onClick={() => onSectionClick(section)}
                aria-pressed={selectedSection === section}
              >
                {section}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default SectionNav;
