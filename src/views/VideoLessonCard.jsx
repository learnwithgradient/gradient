import React, { useEffect, useMemo, useState } from "react";
import InfoCard from "../components/InfoCard";

const PLACEHOLDER_VIDEO_BASE_SRC =
  "https://www.youtube.com/embed/aircAruvnKk?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi&modestbranding=1&rel=0";

function buildPlaceholderPlaylist(lesson) {
  const lessonLabel = lesson?.subtopic ?? "Lesson";

  return [
    {
      id: "part-1",
      playlistLabel: "Video 1",
      title: `${lessonLabel} Overview`,
      description: "Introductory placeholder clip for this lesson card layout.",
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=0`,
    },
    {
      id: "part-2",
      playlistLabel: "Video 2",
      title: `${lessonLabel} Intuition`,
      description: "Second placeholder clip slot for a more visual walk-through.",
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=90`,
    },
    {
      id: "part-3",
      playlistLabel: "Video 3",
      title: `${lessonLabel} Worked Example`,
      description: "Third placeholder clip slot for a concrete example or exercise.",
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=210`,
    },
    {
      id: "part-4",
      playlistLabel: "Video 4",
      title: `${lessonLabel} Recap`,
      description: "Fourth placeholder clip slot for recap, summary, or next steps.",
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=330`,
    },
  ];
}

function VideoLessonCard({ lesson, dealIndex = null }) {
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
      screenClassName="video-lesson-screen"
      cardClassName="video-lesson-card"
      ariaLabel={`${lesson.subtopic} lesson video`}
      dealIndex={dealIndex}
    >
      <div className="video-lesson-split">
        <aside className="video-lesson-playlist-pane" aria-label="Lesson video playlist">
          <p className="video-lesson-pane-label">Videos</p>
          <div className="video-lesson-playlist-scroller">
            {playlist.map((video, index) => {
              const isActive = video.id === selectedVideo?.id;

              return (
                <button
                  key={video.id}
                  type="button"
                  className={`video-lesson-playlist-item${isActive ? " is-active" : ""}`}
                  aria-pressed={isActive}
                  onClick={() => setSelectedVideoId(video.id)}
                >
                  <span className="video-lesson-playlist-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="video-lesson-playlist-text">
                    <span className="video-lesson-playlist-label">{video.playlistLabel}</span>
                    <span className="video-lesson-playlist-title">{video.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="video-lesson-divider" aria-hidden="true" />

        <section className="video-lesson-content-pane">
          <div className="video-lesson-header">
            <p className="video-lesson-eyebrow">{lesson.section}</p>
            <p className="video-lesson-topic">{lesson.topic}</p>
          </div>

          <h1 className="video-lesson-title">{selectedVideo?.title ?? lesson.subtopic}</h1>

          <div className="video-lesson-player-shell">
            <iframe
              className="video-lesson-player"
              src={selectedVideo?.embedSrc ?? PLACEHOLDER_VIDEO_BASE_SRC}
              title={`${selectedVideo?.title ?? lesson.subtopic} placeholder lesson video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <p className="video-lesson-caption">
            {selectedVideo?.description ??
              "Placeholder video card for this lesson while Gradient-specific lesson media is being built."}
          </p>
        </section>
      </div>
    </InfoCard>
  );
}

export default VideoLessonCard;
