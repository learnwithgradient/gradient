import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { MdChevronLeft } from "react-icons/md";
import InfoCard from "../components/InfoCard";

const PLACEHOLDER_VIDEO_WATCH_URL =
  "https://www.youtube.com/watch?v=aircAruvnKk&list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi&index=1";
const PLACEHOLDER_VIDEO_BASE_SRC =
  "https://www.youtube.com/embed/aircAruvnKk?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi&modestbranding=1&rel=0";
const DOCUMENT_PLACEHOLDER_TITLE = "Document Placeholder Title";
const DOCUMENT_PLACEHOLDER_BODY = "Document body text placeholder.";

function getVideoDisplayTitle(video, metadataByWatchUrl, lesson) {
  return metadataByWatchUrl[video.watchUrl]?.title ?? video.fallbackTitle ?? lesson.subtopic;
}

function getLessonPlanEntryLabel(entry) {
  if (entry.label) {
    return entry.label;
  }

  switch (entry.kind) {
    case "intro":
      return "Intro";
    case "document":
      return "Document";
    case "problem-set":
      return "Problem Set";
    case "lab-problem":
      return "Lab Problem";
    case "video":
    default:
      return "Lecture";
  }
}

function buildPlaceholderPlaylist(lesson) {
  return [
    {
      id: "intro",
      kind: "intro",
      label: "Intro",
    },
    {
      id: "lecture-1",
      kind: "video",
      label: "Lecture 1",
      watchUrl: PLACEHOLDER_VIDEO_WATCH_URL,
      fallbackTitle: lesson.subtopic,
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=0`,
    },
    {
      id: "problem-set-1",
      kind: "problem-set",
      label: "Problem Set 1",
    },
    {
      id: "lecture-2",
      kind: "video",
      label: "Lecture 2",
      watchUrl: PLACEHOLDER_VIDEO_WATCH_URL,
      fallbackTitle: `${lesson.subtopic}: Lecture 2`,
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=90`,
    },
    {
      id: "document-1",
      kind: "document",
      label: "Document 1",
      title: DOCUMENT_PLACEHOLDER_TITLE,
      body: DOCUMENT_PLACEHOLDER_BODY,
    },
    {
      id: "lab-problem-1",
      kind: "lab-problem",
      label: "Lab Problem 1",
    },
    {
      id: "document-2",
      kind: "document",
      label: "Document 2",
      title: DOCUMENT_PLACEHOLDER_TITLE,
      body: DOCUMENT_PLACEHOLDER_BODY,
    },
    {
      id: "lecture-3",
      kind: "video",
      label: "Lecture 3",
      watchUrl: PLACEHOLDER_VIDEO_WATCH_URL,
      fallbackTitle: `${lesson.subtopic}: Lecture 3`,
      embedSrc: `${PLACEHOLDER_VIDEO_BASE_SRC}&start=180`,
    },
    {
      id: "problem-set-2",
      kind: "problem-set",
      label: "Problem Set 2",
    },
    {
      id: "lab-problem-2",
      kind: "lab-problem",
      label: "Lab Problem 2",
    },
    {
      id: "document-3",
      kind: "document",
      label: "Document 3",
      title: DOCUMENT_PLACEHOLDER_TITLE,
      body: DOCUMENT_PLACEHOLDER_BODY,
    },
    {
      id: "problem-set-3",
      kind: "problem-set",
      label: "Problem Set 3",
    },
    {
      id: "lab-problem-3",
      kind: "lab-problem",
      label: "Lab Problem 3",
    },
  ];
}

function LessonContent({ entry, metadataByWatchUrl, lesson }) {
  if (!entry) {
    return null;
  }

  if (entry.kind === "intro") {
    return (
      <section className="lesson-card-intro" aria-label={`${lesson.subtopic} introduction`}>
        <h1 className="lesson-card-intro-title">
          <span className="lesson-card-intro-kicker">{lesson.topic}</span>
          <span className="lesson-card-intro-main">{lesson.subtopic}</span>
        </h1>
        <p className="lesson-card-intro-subtitle">{lesson.section}</p>
      </section>
    );
  }

  if (entry.kind === "document") {
    return (
      <article className="lesson-card-document">
        <h1 className="lesson-card-document-title">{entry.title ?? lesson.subtopic}</h1>
        {entry.body ? <p className="lesson-card-document-body">{entry.body}</p> : null}
      </article>
    );
  }

  if (entry.kind === "problem-set" || entry.kind === "lab-problem") {
    return <div className="lesson-card-empty-content" aria-hidden="true" />;
  }

  const selectedVideoMetadata = entry.watchUrl ? metadataByWatchUrl[entry.watchUrl] ?? null : null;
  const selectedVideoTitle = getVideoDisplayTitle(entry, metadataByWatchUrl, lesson);

  return (
    <div className="lesson-card-media-stack">
      <div className="lesson-card-player-shell">
        <iframe
          className="lesson-card-player"
          src={entry.embedSrc ?? PLACEHOLDER_VIDEO_BASE_SRC}
          title={`${selectedVideoTitle} lesson video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className="lesson-card-video-meta">
        <p className="lesson-card-video-title">Video Title Placeholder</p>
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
  );
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
  const [isPlanCollapsed, setIsPlanCollapsed] = useState(false);
  const planScrollerRef = useRef(null);
  const planRegionId = useId();
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
          top: hasOverflow && scrollTop > 0,
          bottom: hasOverflow && scrollTop + clientHeight < scrollHeight,
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

  const selectedEntry =
    playlist.find((video) => video.id === selectedVideoId) ?? playlist[0] ?? null;

  const toggleClassName = [
    "lesson-card-plan-toggle",
    isPlanCollapsed ? "is-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handlePlanToggle = () => {
    setIsPlanCollapsed((currentIsPlanCollapsed) => !currentIsPlanCollapsed);
  };

  return (
    <InfoCard
      screenClassName="lesson-card-screen"
      cardClassName="lesson-card"
      ariaLabel={`${lesson.subtopic} lesson card`}
      dealIndex={dealIndex}
    >
      <div className={`lesson-card-split${isPlanCollapsed ? " is-plan-collapsed" : ""}`}>
        <aside className="lesson-card-plan-pane" id={planRegionId} aria-label="Lesson plan">
          <div
            className={`lesson-card-plan-scroll-shell${
              planFadeState.top ? " has-top-fade" : ""
            }${planFadeState.bottom ? " has-bottom-fade" : ""}`}
          >
            <div className="lesson-card-plan-scroller" ref={planScrollerRef}>
              {playlist.map((video, index) => {
                const isActive = video.id === selectedEntry?.id;

                return (
                  <button
                    key={video.id}
                    type="button"
                    className={`lesson-card-plan-item${isActive ? " is-active" : ""}`}
                    aria-pressed={isActive}
                    aria-label={`${index}. ${getLessonPlanEntryLabel(video)}`}
                    onClick={() => setSelectedVideoId(video.id)}
                  >
                    <span className="lesson-card-plan-index" aria-hidden="true">
                      {index}
                    </span>
                    <span className="lesson-card-plan-title" title={getLessonPlanEntryLabel(video)}>
                      {getLessonPlanEntryLabel(video)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="lesson-card-divider" aria-hidden="true" />

        <section className="lesson-card-content-pane">
          <button
            type="button"
            className={toggleClassName}
            aria-controls={planRegionId}
            aria-expanded={!isPlanCollapsed}
            aria-label={isPlanCollapsed ? "Show lesson plan" : "Hide lesson plan"}
            onClick={handlePlanToggle}
          >
            <span className="lesson-card-plan-toggle-icon" aria-hidden="true">
              <MdChevronLeft focusable="false" />
            </span>
          </button>

          <LessonContent
            entry={selectedEntry}
            metadataByWatchUrl={metadataByWatchUrl}
            lesson={lesson}
          />
        </section>
      </div>
    </InfoCard>
  );
}

export default LessonCard;
