import React, { useEffect, useMemo, useState } from "react";
import InfoCard from "../components/InfoCard";

const PLACEHOLDER_VIDEO_BASE_SRC =
  "https://www.youtube.com/embed/aircAruvnKk?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi&modestbranding=1&rel=0";
const PLACEHOLDER_VIDEO_TITLE = "But what is a neural network? | Deep learning chapter 1";

function buildPlaceholderPlaylist(lesson) {
  return [
    {
      id: "part-1",
      title: PLACEHOLDER_VIDEO_TITLE,
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=0`,
    },
    {
      id: "part-2",
      title: PLACEHOLDER_VIDEO_TITLE,
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=90`,
    },
    {
      id: "part-3",
      title: PLACEHOLDER_VIDEO_TITLE,
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=210`,
    },
    {
      id: "part-4",
      title: PLACEHOLDER_VIDEO_TITLE,
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=330`,
    },
  ];
}

function LessonCard({ lesson, dealIndex = null }) {
  if (!lesson) {
    return null;
  }

  const playlist = useMemo(
    () => buildPlaceholderPlaylist(lesson),
    [lesson.section, lesson.topic, lesson.subtopic]
  );
  const [selectedVideoId, setSelectedVideoId] = useState(playlist[0]?.id ?? null);

  useEffect(() => {
    setSelectedVideoId(playlist[0]?.id ?? null);
  }, [playlist]);

  const selectedVideo =
    playlist.find((video) => video.id === selectedVideoId) ?? playlist[0] ?? null;

  return (
    <InfoCard
      screenClassName="lesson-card-screen"
      cardClassName="lesson-card"
      ariaLabel={`${lesson.subtopic} lesson card`}
      dealIndex={dealIndex}
    >
      <div className="lesson-card-split">
        <aside className="lesson-card-plan-pane" aria-label="Lesson plan">
          <p className="lesson-card-pane-label">Lesson Plan</p>
          <div className="lesson-card-plan-scroller">
            {playlist.map((video, index) => {
              const isActive = video.id === selectedVideo?.id;

              return (
                <button
                  key={video.id}
                  type="button"
                  className={`lesson-card-plan-item${isActive ? " is-active" : ""}`}
                  aria-pressed={isActive}
                  onClick={() => setSelectedVideoId(video.id)}
                >
                  <span className="lesson-card-plan-icon" aria-hidden="true">
                    <span className="lesson-card-plan-icon-triangle" />
                  </span>
                  <span className="lesson-card-plan-title" title={video.title}>
                    {video.title}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="lesson-card-divider" aria-hidden="true" />

        <section className="lesson-card-content-pane">
          <p className="lesson-card-breadcrumb">
            <span>{lesson.section}</span>
            <span className="lesson-card-breadcrumb-separator" aria-hidden="true">
              •
            </span>
            <span>{lesson.topic}</span>
            <span className="lesson-card-breadcrumb-separator" aria-hidden="true">
              •
            </span>
            <span>{lesson.subtopic}</span>
          </p>

          <div className="lesson-card-player-shell">
            <iframe
              className="lesson-card-player"
              src={selectedVideo?.embedSrc ?? PLACEHOLDER_VIDEO_BASE_SRC}
              title={`${selectedVideo?.title ?? lesson.subtopic} placeholder lesson video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </section>
      </div>
    </InfoCard>
  );
}

export default LessonCard;
