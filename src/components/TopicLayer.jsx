import React from "react";

function TopicLayer({
  section,
  topicEntries,
  activeTopic,
  layerClassName,
  layerRef = null,
  layerKey,
  onTopicEnter,
  onTopicLeave,
  onSubtopicEnter,
  onSubtopicLeave,
  onSubtopicActivate,
}) {
  return (
    <div
      key={layerKey}
      className={`projector-topic-layer ${layerClassName}`}
      ref={layerRef}
    >
      <p className="projector-topic-heading">{section}</p>
      <div className="projector-topic-grid">
        {topicEntries.map(({ topic, subtopics }) => (
          <article
            className={`projector-topic-card${activeTopic === topic ? " is-active" : ""}`}
            key={`${section}-${topic}`}
            onMouseEnter={() => onTopicEnter(topic)}
            onMouseLeave={onTopicLeave}
          >
            <h2 title={topic}>{topic}</h2>
            <ul>
              {subtopics.map((subtopic) => (
                <li
                  className="projector-subtopic-item"
                  key={`${topic}-${subtopic}`}
                  title={subtopic}
                  onMouseEnter={(event) => onSubtopicEnter(event.currentTarget)}
                  onMouseLeave={(event) => onSubtopicLeave(event.currentTarget)}
                  onClick={() => onSubtopicActivate(section, topic, subtopic)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSubtopicActivate(section, topic, subtopic);
                    }
                  }}
                >
                  <span className="projector-subtopic-viewport">
                    <span
                      className="projector-subtopic-measure"
                      aria-hidden="true"
                    >
                      {subtopic}
                    </span>
                    <span className="projector-subtopic-track">
                      <span className="projector-subtopic-text projector-subtopic-text--primary">
                        {subtopic}
                      </span>
                      <span
                        className="projector-subtopic-text projector-subtopic-text--clone"
                        aria-hidden="true"
                      >
                        {subtopic}
                      </span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

export default TopicLayer;
