import React, { useEffect, useMemo, useRef, useState } from "react";
import InfoCard from "../components/InfoCard";

const PLACEHOLDER_VIDEO_WATCH_URL =
  "https://www.youtube.com/watch?v=aircAruvnKk&list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi&index=1";
const PLACEHOLDER_VIDEO_BASE_SRC =
  "https://www.youtube.com/embed/aircAruvnKk?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi&modestbranding=1&rel=0";

function getVideoDisplayTitle(video, metadataByWatchUrl, lesson) {
  return metadataByWatchUrl[video.watchUrl]?.title ?? video.fallbackTitle ?? lesson.subtopic;
}

function buildPlaceholderPlaylist(lesson) {
  return [
    {
      id: "part-1",
      watchUrl: PLACEHOLDER_VIDEO_WATCH_URL,
      fallbackTitle: lesson.subtopic,
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=0`,
    },
    {
      id: "part-2",
      watchUrl: PLACEHOLDER_VIDEO_WATCH_URL,
      fallbackTitle: lesson.subtopic,
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=90`,
    },
    {
      id: "part-3",
      watchUrl: PLACEHOLDER_VIDEO_WATCH_URL,
      fallbackTitle: lesson.subtopic,
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=210`,
    },
    {
      id: "part-4",
      watchUrl: PLACEHOLDER_VIDEO_WATCH_URL,
      fallbackTitle: lesson.subtopic,
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
  const [metadataByWatchUrl, setMetadataByWatchUrl] = useState({});
  const planScrollerRef = useRef(null);
  const [planFadeState, setPlanFadeState] = useState({ top: false, bottom: false });

  useEffect(() => {
    setSelectedVideoId(playlist[0]?.id ?? null);
  }, [playlist]);

  useEffect(() => {
    let isCancelled = false;

    const uniqueWatchUrls = [...new Set(playlist.map((video) => video.watchUrl).filter(Boolean))];
    const missingWatchUrls = uniqueWatchUrls.filter(
      (watchUrl) => !Object.prototype.hasOwnProperty.call(metadataByWatchUrl, watchUrl)
    );

    if (missingWatchUrls.length === 0) {
      return undefined;
    }

    async function loadMetadata() {
      const entries = await Promise.all(
        missingWatchUrls.map(async (watchUrl) => {
          try {
            const response = await fetch(
              `/api/youtube/oembed?url=${encodeURIComponent(watchUrl)}`
            );

            if (!response.ok) {
              return [watchUrl, null];
            }

            return [watchUrl, await response.json()];
          } catch {
            return [watchUrl, null];
          }
        })
      );

      if (isCancelled) {
        return;
      }

      setMetadataByWatchUrl((currentMetadata) => {
        const nextMetadata = { ...currentMetadata };

        entries.forEach(([watchUrl, metadata]) => {
          nextMetadata[watchUrl] = metadata;
        });

        return nextMetadata;
      });
    }

    loadMetadata();

    return () => {
      isCancelled = true;
    };
  }, [playlist, metadataByWatchUrl]);

  useEffect(() => {
    const scroller = planScrollerRef.current;

    if (!scroller) {
      return undefined;
    }

    let frameId = 0;

    const syncFadeState = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const { scrollTop, clientHeight, scrollHeight } = scroller;
        const hasOverflow = scrollHeight - clientHeight > 1;
        const nextFadeState = {
          top: hasOverflow && scrollTop > 1,
          bottom: hasOverflow && scrollTop + clientHeight < scrollHeight - 1,
        };

        setPlanFadeState((currentFadeState) =>
          currentFadeState.top === nextFadeState.top &&
          currentFadeState.bottom === nextFadeState.bottom
            ? currentFadeState
            : nextFadeState
        );
      });
    };

    syncFadeState();

    scroller.addEventListener("scroll", syncFadeState, { passive: true });

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(syncFadeState);
    resizeObserver?.observe(scroller);
    if (scroller.parentElement) {
      resizeObserver?.observe(scroller.parentElement);
    }

    window.addEventListener("resize", syncFadeState);

    return () => {
      cancelAnimationFrame(frameId);
      scroller.removeEventListener("scroll", syncFadeState);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncFadeState);
    };
  }, [playlist, metadataByWatchUrl]);

  const selectedVideo =
    playlist.find((video) => video.id === selectedVideoId) ?? playlist[0] ?? null;
  const selectedVideoMetadata = selectedVideo
    ? metadataByWatchUrl[selectedVideo.watchUrl] ?? null
    : null;
  const selectedVideoTitle = selectedVideo
    ? getVideoDisplayTitle(selectedVideo, metadataByWatchUrl, lesson)
    : lesson.subtopic;

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
          <div
            className={`lesson-card-plan-scroll-shell${
              planFadeState.top ? " has-top-fade" : ""
            }${planFadeState.bottom ? " has-bottom-fade" : ""}`}
          >
            <div className="lesson-card-plan-scroller" ref={planScrollerRef}>
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
                    <span className="lesson-card-plan-index" aria-hidden="true">
                      {index}
                    </span>
                    <span
                      className="lesson-card-plan-title"
                      title={getVideoDisplayTitle(video, metadataByWatchUrl, lesson)}
                    >
                      {getVideoDisplayTitle(video, metadataByWatchUrl, lesson)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="lesson-card-divider" aria-hidden="true" />

        <section className="lesson-card-content-pane">
          <div className="lesson-card-media-stack">
            <div className="lesson-card-player-shell">
              <iframe
                className="lesson-card-player"
                src={selectedVideo?.embedSrc ?? PLACEHOLDER_VIDEO_BASE_SRC}
                title={`${selectedVideoTitle} lesson video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            <div className="lesson-card-video-meta">
              <p className="lesson-card-video-title" title={selectedVideoTitle}>
                {selectedVideoTitle}
              </p>
              {selectedVideoMetadata?.authorName ? (
                selectedVideoMetadata.authorUrl ? (
                  <a
                    className="lesson-card-video-author"
                    href={selectedVideoMetadata.authorUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={selectedVideoMetadata.authorName}
                  >
                    {selectedVideoMetadata.authorName}
                  </a>
                ) : (
                  <p className="lesson-card-video-author" title={selectedVideoMetadata.authorName}>
                    {selectedVideoMetadata.authorName}
                  </p>
                )
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </InfoCard>
  );
}

export default LessonCard;
