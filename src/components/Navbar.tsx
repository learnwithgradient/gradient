import React, { useEffect, useRef, useState } from "react";
import { FaCircleUser, FaRegCircleUser } from "react-icons/fa6";
import { PROJECTOR_SECTIONS, PROJECTOR_TOPICS } from "../engine/Lessons";
import {
  SECTION_SLUGS,
  buildLessonPath,
  parseLessonPath,
  findLessonBySlugs,
} from "../engine/lessonRouting";
import HomePage from "../pages/HomePage";
import PageNotFound from "../pages/PageNotFound";
import SectionNav from "./SectionNav";
import TopicLayer from "./TopicLayer";
import logoIcon from "../../assets/icons/logo.svg";
import "./Navbar.css";

const OPEN_MS = 900;
const CLOSE_MS = 680;
const DRAG_THRESHOLD_PX = 26;
const TOPIC_MORPH_TIME_MS = 820;
const MORPH_BLUR_BASE = 5;
const MORPH_MAX_BLUR_PX = 22;
const MORPH_OPACITY_EXPONENT = 0.1;
const TOPBAR_TEXT_LINKS = [
  { slug: "mission", label: "Mission" },
  { slug: "contact", label: "Contact" },
  { slug: "donate", label: "Donate" },
];
const RESERVED_COMING_SOON_ROUTES = new Set([
  "account",
  ...TOPBAR_TEXT_LINKS.map((link) => link.slug),
]);

function getPathSegments(pathname) {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}

function isAccountPath(pathname) {
  const pathSegments = getPathSegments(pathname);
  return pathSegments.length === 1 && pathSegments[0] === "account";
}

// Apply Valgo blur+opacity to a single text element given a 0→1 visible fraction.
function applyElementMorph(el, visibleFraction) {
  if (!el) return;
  const baseOpacityRaw = Number.parseFloat(el.dataset.morphBaseOpacity ?? "1");
  const baseOpacity = Number.isFinite(baseOpacityRaw) ? baseOpacityRaw : 1;
  const f = Math.max(visibleFraction, 0.0001);
  const blur = Math.min(MORPH_BLUR_BASE / f - MORPH_BLUR_BASE, MORPH_MAX_BLUR_PX);
  const opacity = Math.pow(f, MORPH_OPACITY_EXPONENT) * baseOpacity;
  el.style.filter = `blur(${blur.toFixed(2)}px)`;
  el.style.opacity = opacity.toFixed(4);
}

function resolvePathStatus(pathname) {
  const pathSegments = getPathSegments(pathname);

  if (pathSegments.length === 0) {
    return { status: "home", matchedLesson: null };
  }

  if (
    pathSegments.length === 1 &&
    (SECTION_SLUGS.has(pathSegments[0]) || RESERVED_COMING_SOON_ROUTES.has(pathSegments[0]))
  ) {
    return { status: "coming-soon", matchedLesson: null };
  }

  const parsedPath = parseLessonPath(pathname);
  if (!parsedPath) {
    return { status: "not-found", matchedLesson: null };
  }

  const matchedLesson = findLessonBySlugs(
    parsedPath.sectionSlug,
    parsedPath.topicSlug,
    parsedPath.subtopicSlug
  );

  if (!matchedLesson) {
    return { status: "not-found", matchedLesson: null };
  }

  return { status: "coming-soon", matchedLesson };
}

function Navbar() {
  const [screenPhase, setScreenPhase] = useState("closed");
  const [isRopeGrabbed, setIsRopeGrabbed] = useState(false);
  const [selectedSection, setSelectedSection] = useState(PROJECTOR_SECTIONS[0]);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [displayedSection, setDisplayedSection] = useState(PROJECTOR_SECTIONS[0]);
  const [isMorphingTopics, setIsMorphingTopics] = useState(false);
  const [morphFromSection, setMorphFromSection] = useState(PROJECTOR_SECTIONS[0]);
  const [morphToSection, setMorphToSection] = useState(PROJECTOR_SECTIONS[0]);
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const [activePathname, setActivePathname] = useState(() => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname;
  });
  const [routeStatus, setRouteStatus] = useState(() => {
    if (typeof window === "undefined") return "home";
    return resolvePathStatus(window.location.pathname).status;
  });

  const timerRef = useRef(null);
  const morphFrameRef = useRef(null);
  const morphStartRef = useRef(0);
  const displayedSectionRef = useRef(PROJECTOR_SECTIONS[0]);
  const morphTargetSectionRef = useRef(PROJECTOR_SECTIONS[0]);
  const morphStateRef = useRef({
    status: "idle",
    from: PROJECTOR_SECTIONS[0],
    to: PROJECTOR_SECTIONS[0],
  });
  const isMorphingTopicsRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);
  const morphFromLayerRef = useRef(null);
  const morphToLayerRef = useRef(null);
  const topicStageRef = useRef(null);
  const fromTextNodesRef = useRef([]);
  const toTextNodesRef = useRef([]);
  const screenPhaseRef = useRef("closed");
  const ropeDragRef = useRef({ active: false, pointerId: null, startY: 0, acted: false });
  const subtopicReturnListenersRef = useRef(new WeakMap());

  const parseCssNumber = (value, fallback = 0) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const getTrackTranslateX = (track) => {
    if (!track) return 0;
    const transform = window.getComputedStyle(track).transform;
    if (!transform || transform === "none") return 0;

    try {
      return new DOMMatrixReadOnly(transform).m41;
    } catch {
      const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
      if (matrixMatch?.[1]) {
        const parts = matrixMatch[1].split(",").map((part) => Number.parseFloat(part.trim()));
        return Number.isFinite(parts[4]) ? parts[4] : 0;
      }
      const matrix3dMatch = transform.match(/matrix3d\(([^)]+)\)/);
      if (matrix3dMatch?.[1]) {
        const parts = matrix3dMatch[1].split(",").map((part) => Number.parseFloat(part.trim()));
        return Number.isFinite(parts[12]) ? parts[12] : 0;
      }
      return 0;
    }
  };

  const clearSubtopicReturnTimeout = (item) => {
    if (!item) return;

    const returnListener = subtopicReturnListenersRef.current.get(item);
    if (returnListener) {
      returnListener.track.removeEventListener("transitionend", returnListener.handler);
      subtopicReturnListenersRef.current.delete(item);
    }

    const timeoutRaw = item?.dataset?.subtopicReturnTimeoutId;
    if (!timeoutRaw) return;
    window.clearTimeout(Number.parseInt(timeoutRaw, 10));
    delete item.dataset.subtopicReturnTimeoutId;
  };

  const finalizeSubtopicReturn = (item, track) => {
    if (!item || !track) return;

    clearSubtopicReturnTimeout(item);

    // Snap to canonical start frame first (visually identical to the cloned end),
    // then clear returning state so there is no post-return jump.
    track.style.animation = "none";
    track.style.transition = "none";
    track.style.transform = "translateX(0)";
    void track.offsetWidth;

    item.classList.remove("is-returning");
    item.style.removeProperty("--subtopic-return-duration");
    item.style.removeProperty("--subtopic-pan-delay");

    requestAnimationFrame(() => {
      if (!item.isConnected) return;
      track.style.removeProperty("animation");
      track.style.removeProperty("transition");
      track.style.removeProperty("transform");
    });
  };

  const startSubtopicPan = (item) => {
    if (!item?.classList.contains("is-overflowing")) return;
    const track = item.querySelector(".projector-subtopic-track");
    if (!track) return;

    clearSubtopicReturnTimeout(item);

    const loopDistance = Math.max(parseCssNumber(item.style.getPropertyValue("--subtopic-pan-loop-distance"), 0), 1);
    const panDuration = Math.max(parseCssNumber(item.style.getPropertyValue("--subtopic-pan-duration"), 0), 1);
    const currentX = getTrackTranslateX(track);
    const traveled = Math.abs(currentX) % loopDistance;
    const delayMs = -((traveled / loopDistance) * panDuration);

    item.classList.remove("is-returning");
    item.classList.add("is-panning");
    item.style.removeProperty("--subtopic-return-duration");
    item.style.setProperty("--subtopic-pan-delay", `${delayMs.toFixed(0)}ms`);

    track.style.removeProperty("animation");
    track.style.removeProperty("transition");
    track.style.removeProperty("transform");
  };

  const stopSubtopicPan = (item) => {
    if (!item?.classList.contains("is-overflowing")) return;
    const track = item.querySelector(".projector-subtopic-track");
    if (!track) return;

    clearSubtopicReturnTimeout(item);

    const loopDistance = Math.max(parseCssNumber(item.style.getPropertyValue("--subtopic-pan-loop-distance"), 0), 1);
    const panDuration = Math.max(parseCssNumber(item.style.getPropertyValue("--subtopic-pan-duration"), 0), 1);
    const currentX = getTrackTranslateX(track);
    const traveled = Math.abs(currentX) % loopDistance;
    if (traveled < 1) {
      item.classList.remove("is-panning");
      item.classList.remove("is-returning");
      item.style.removeProperty("--subtopic-pan-delay");
      item.style.removeProperty("--subtopic-return-duration");
      track.style.removeProperty("animation");
      track.style.removeProperty("transition");
      track.style.removeProperty("transform");
      return;
    }
    const remainingDistance = loopDistance - traveled;
    const returnDuration = Math.max((remainingDistance / loopDistance) * panDuration, 180);

    item.classList.remove("is-panning");
    item.classList.add("is-returning");
    item.style.removeProperty("--subtopic-pan-delay");
    item.style.setProperty("--subtopic-return-duration", `${returnDuration.toFixed(0)}ms`);

    track.style.animation = "none";
    track.style.transition = "none";
    track.style.transform = `translateX(${currentX.toFixed(3)}px)`;
    void track.offsetWidth;

    track.style.removeProperty("animation");
    track.style.removeProperty("transition");
    track.style.transform = `translateX(${-loopDistance}px)`;

    const handleReturnTransitionEnd = (event) => {
      if (event.propertyName !== "transform") return;
      if (!item.classList.contains("is-returning")) return;
      finalizeSubtopicReturn(item, track);
    };
    track.addEventListener("transitionend", handleReturnTransitionEnd);
    subtopicReturnListenersRef.current.set(item, {
      track,
      handler: handleReturnTransitionEnd,
    });

    const timeoutId = window.setTimeout(() => {
      if (!item.classList.contains("is-returning")) return;
      finalizeSubtopicReturn(item, track);
    }, returnDuration + 140);

    item.dataset.subtopicReturnTimeoutId = String(timeoutId);
  };

  const clearPhaseTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => () => {
    clearPhaseTimer();
    if (morphFrameRef.current) { cancelAnimationFrame(morphFrameRef.current); morphFrameRef.current = null; }
    fromTextNodesRef.current = [];
    toTextNodesRef.current = [];
    const stage = topicStageRef.current;
    if (stage) {
      stage.querySelectorAll(".projector-subtopic-item").forEach((item) => {
        clearSubtopicReturnTimeout(item);
      });
    }
  }, []);

  useEffect(() => { screenPhaseRef.current = screenPhase; }, [screenPhase]);
  useEffect(() => { displayedSectionRef.current = displayedSection; }, [displayedSection]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { prefersReducedMotionRef.current = mq.matches; };
    sync();
    mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);
    return () => mq.removeEventListener ? mq.removeEventListener("change", sync) : mq.removeListener(sync);
  }, []);

  useEffect(() => {
    const measureSubtopicOverflow = () => {
      const stage = topicStageRef.current;
      if (!stage) return;

      const subtopicItems = stage.querySelectorAll(".projector-subtopic-item");
      subtopicItems.forEach((item) => {
        const viewport = item.querySelector(".projector-subtopic-viewport");
        const primaryText = item.querySelector(".projector-subtopic-text--primary");
        if (!viewport || !primaryText) return;

        const textWidth = Math.ceil(primaryText.scrollWidth);
        const overflowPx = Math.ceil(textWidth - viewport.clientWidth);
        if (overflowPx > 2) {
          item.classList.add("is-overflowing");
          const panGapPx = 26;
          const loopDistancePx = textWidth + panGapPx;
          item.style.setProperty("--subtopic-pan-gap", `${panGapPx}px`);
          item.style.setProperty("--subtopic-pan-loop-distance", `${loopDistancePx}px`);
          const durationMs = Math.min(Math.max(loopDistancePx * 22, 2400), 12000);
          item.style.setProperty("--subtopic-pan-duration", `${durationMs}ms`);
          return;
        }

        clearSubtopicReturnTimeout(item);
        item.classList.remove("is-overflowing");
        item.classList.remove("is-panning");
        item.classList.remove("is-returning");
        item.style.removeProperty("--subtopic-pan-gap");
        item.style.removeProperty("--subtopic-pan-loop-distance");
        item.style.removeProperty("--subtopic-pan-duration");
        item.style.removeProperty("--subtopic-pan-delay");
        item.style.removeProperty("--subtopic-return-duration");
      });
    };

    let frame = requestAnimationFrame(measureSubtopicOverflow);
    const remeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measureSubtopicOverflow);
    };

    window.addEventListener("resize", remeasure);
    if (document.fonts?.ready) {
      document.fonts.ready.then(remeasure);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", remeasure);
    };
  }, [displayedSection, isMorphingTopics, morphFromSection, morphToSection, screenPhase]);

  const openProjectorScreen = () => {
    clearPhaseTimer();
    screenPhaseRef.current = "opening";
    setScreenPhase("opening");
    timerRef.current = setTimeout(() => { screenPhaseRef.current = "open"; setScreenPhase("open"); timerRef.current = null; }, OPEN_MS);
  };

  const closeProjectorScreen = () => {
    clearPhaseTimer();
    screenPhaseRef.current = "closing";
    setScreenPhase("closing");
    timerRef.current = setTimeout(() => { screenPhaseRef.current = "closed"; setScreenPhase("closed"); timerRef.current = null; }, CLOSE_MS);
  };

  const isOpenLikeNow = () => screenPhaseRef.current === "open" || screenPhaseRef.current === "opening";
  const isOpenLike = screenPhase === "open" || screenPhase === "opening";
  const activeSection = hoveredSection ?? selectedSection;
  const activeTopic = hoveredTopic;
  const isAccountRoute = isAccountPath(activePathname);
  const activePathSegments = getPathSegments(activePathname);

  const syncStateFromPath = (pathname) => {
    setActivePathname(pathname);
    const { status, matchedLesson } = resolvePathStatus(pathname);
    setRouteStatus(status);
    return matchedLesson;
  };

  const navigateToSubtopicRoute = (section, topic, subtopic) => {
    const nextPath = buildLessonPath(section, topic, subtopic);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ section, topic, subtopic }, "", nextPath);
    }

    syncStateFromPath(nextPath);

    if (isOpenLikeNow()) {
      closeProjectorScreen();
    }
  };

  const navigateHome = () => {
    const nextPath = "/";
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    syncStateFromPath(nextPath);
    if (isOpenLikeNow()) {
      closeProjectorScreen();
    }
  };

  const navigateTopRoute = (routePath) => {
    if (window.location.pathname !== routePath) {
      window.history.pushState({}, "", routePath);
    }
    syncStateFromPath(routePath);
    if (isOpenLikeNow()) {
      closeProjectorScreen();
    }
  };

  const navigateAccount = () => {
    const nextPath = "/account";
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    syncStateFromPath(nextPath);
    if (isOpenLikeNow()) {
      closeProjectorScreen();
    }
  };

  const getMorphTextNodes = (layerEl) => {
    if (!layerEl) {
      return [];
    }

    return Array.from(
      layerEl.querySelectorAll(".projector-topic-heading, .projector-topic-card h2, .projector-topic-card li")
    );
  };

  const seedMorphNodeStyles = () => {
    const fromNodes = getMorphTextNodes(morphFromLayerRef.current);
    const toNodes = getMorphTextNodes(morphToLayerRef.current);

    if (fromNodes.length === 0 || toNodes.length === 0) {
      return false;
    }

    fromTextNodesRef.current = fromNodes;
    toTextNodesRef.current = toNodes;

    fromNodes.forEach((node) => {
      const computed = window.getComputedStyle(node);
      const baseOpacityRaw = Number.parseFloat(computed.opacity);
      const baseOpacity = Number.isFinite(baseOpacityRaw) ? baseOpacityRaw : 1;
      node.dataset.morphBaseOpacity = baseOpacity.toString();
      node.style.color = computed.color;
      node.style.filter = "blur(0px)";
      node.style.opacity = baseOpacity.toFixed(4);
    });

    toNodes.forEach((node) => {
      const computed = window.getComputedStyle(node);
      const baseOpacityRaw = Number.parseFloat(computed.opacity);
      const baseOpacity = Number.isFinite(baseOpacityRaw) ? baseOpacityRaw : 1;
      node.dataset.morphBaseOpacity = baseOpacity.toString();
      node.style.color = computed.color;
      node.style.filter = `blur(${MORPH_MAX_BLUR_PX}px)`;
      node.style.opacity = "0";
    });

    return true;
  };

  const clearMorphNodeRefs = () => {
    fromTextNodesRef.current.forEach((node) => {
      delete node.dataset.morphBaseOpacity;
    });
    toTextNodesRef.current.forEach((node) => {
      delete node.dataset.morphBaseOpacity;
    });
    fromTextNodesRef.current = [];
    toTextNodesRef.current = [];
  };

  const beginTopicMorph = (fromSection, toSection) => {
    // Skip duplicate requests while already morphing to the same target.
    if (
      morphStateRef.current.status === "morphing" &&
      morphStateRef.current.to === toSection
    ) {
      return;
    }

    if (fromSection === toSection) {
      setDisplayedSection(toSection); displayedSectionRef.current = toSection;
      setIsMorphingTopics(false); isMorphingTopicsRef.current = false;
      morphStateRef.current = { status: "idle", from: toSection, to: toSection };
      return;
    }
    if (prefersReducedMotionRef.current) {
      setDisplayedSection(toSection); displayedSectionRef.current = toSection;
      setIsMorphingTopics(false); isMorphingTopicsRef.current = false;
      morphStateRef.current = { status: "idle", from: toSection, to: toSection };
      return;
    }
    if (morphFrameRef.current) { cancelAnimationFrame(morphFrameRef.current); morphFrameRef.current = null; }

    morphStateRef.current = { status: "morphing", from: fromSection, to: toSection };
    setMorphFromSection(fromSection);
    setMorphToSection(toSection);
    setIsMorphingTopics(true);
    isMorphingTopicsRef.current = true;
    morphStartRef.current = 0;

    const waitForMorphLayers = () => {
      if (!seedMorphNodeStyles()) {
        morphFrameRef.current = requestAnimationFrame(waitForMorphLayers);
        return;
      }

      morphStartRef.current = 0;

      const morphStep = (timestamp) => {
        if (!morphStartRef.current) morphStartRef.current = timestamp;
        const elapsed = timestamp - morphStartRef.current;
        const fraction = Math.min(elapsed / TOPIC_MORPH_TIME_MS, 1);

        // Apply per-element Valgo morph to old/new text node sets.
        fromTextNodesRef.current.forEach((node) => applyElementMorph(node, 1 - fraction));
        toTextNodesRef.current.forEach((node) => applyElementMorph(node, fraction));

        if (fraction < 1) {
          morphFrameRef.current = requestAnimationFrame(morphStep);
          return;
        }

        morphFrameRef.current = null;
        clearMorphNodeRefs();
        setDisplayedSection(toSection); displayedSectionRef.current = toSection;
        setIsMorphingTopics(false); isMorphingTopicsRef.current = false;
        morphStateRef.current = { status: "idle", from: toSection, to: toSection };

        const queued = morphTargetSectionRef.current;
        if (queued !== toSection) beginTopicMorph(toSection, queued);
      };

      morphFrameRef.current = requestAnimationFrame(morphStep);
    };

    morphFrameRef.current = requestAnimationFrame(waitForMorphLayers);
  };

  useEffect(() => {
    morphTargetSectionRef.current = activeSection;
    const current = displayedSectionRef.current;
    const inFlightTarget =
      morphStateRef.current.status === "morphing" ? morphStateRef.current.to : current;

    if (activeSection === inFlightTarget) return;
    if (isMorphingTopicsRef.current) return;
    beginTopicMorph(current, activeSection);
  }, [activeSection]);

  useEffect(() => {
    syncStateFromPath(window.location.pathname);

    const handlePopState = () => {
      syncStateFromPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSectionHover = (section) => {
    setHoveredSection(section);
    setSelectedSection(section);
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setHoveredSection(section);
    setHoveredTopic(null);
  };

  const toggleProjectorScreen = () => {
    if (isOpenLikeNow()) { closeProjectorScreen(); return; }
    openProjectorScreen();
  };

  const startRopeDrag = (event) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    ropeDragRef.current = { active: true, pointerId: event.pointerId, startY: event.clientY, acted: false };
    setIsRopeGrabbed(true);
  };

  const moveRopeDrag = (event) => {
    const d = ropeDragRef.current;
    if (!d.active || d.pointerId !== event.pointerId) return;
    const deltaY = event.clientY - d.startY;
    if (deltaY >= DRAG_THRESHOLD_PX && !isOpenLikeNow()) { d.acted = true; d.startY = event.clientY; openProjectorScreen(); return; }
    if (deltaY <= -DRAG_THRESHOLD_PX && isOpenLikeNow()) { d.acted = true; d.startY = event.clientY; closeProjectorScreen(); }
  };

  const endRopeDrag = (event, allowTapToggle) => {
    const d = ropeDragRef.current;
    if (!d.active || d.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    ropeDragRef.current = { active: false, pointerId: null, startY: 0, acted: false };
    setIsRopeGrabbed(false);
    if (allowTapToggle && !d.acted && Math.abs(event.clientY - d.startY) < DRAG_THRESHOLD_PX) toggleProjectorScreen();
  };

  return (
    <div className={`app-shell${routeStatus !== "app" ? " app-shell--status" : ""}`}>
      {isOpenLike ? (
        <div className="projector-backdrop" onClick={closeProjectorScreen} role="presentation" aria-hidden="true" />
      ) : null}

      <header className={`topbar screen-${screenPhase}`}>
        <div className="topbar-controls" aria-label="Global navigation">
          <button
            type="button"
            className="topbar-icon-btn topbar-home-btn"
            aria-label="Home"
            onClick={navigateHome}
          >
            <img src={logoIcon} alt="" aria-hidden="true" className="topbar-home-icon" />
          </button>

          <div className="topbar-link-group" role="group" aria-label="Primary links">
            {TOPBAR_TEXT_LINKS.map(({ slug, label }) => {
              const isActive =
                activePathSegments.length === 1 && activePathSegments[0] === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  className={`topbar-text-btn${isActive ? " is-active" : ""}`}
                  aria-pressed={isActive}
                  onClick={() => navigateTopRoute(`/${slug}`)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={`topbar-icon-btn topbar-profile-btn${isAccountRoute ? " is-active" : ""}`}
            aria-label="Profile"
            aria-pressed={isAccountRoute}
            onClick={navigateAccount}
          >
            <span className="topbar-profile-icon-stack" aria-hidden="true">
              <FaRegCircleUser className="topbar-profile-icon topbar-profile-icon--outline" />
              <FaCircleUser className="topbar-profile-icon topbar-profile-icon--filled" />
            </span>
          </button>
        </div>

        <div className="projector-body">
          <div className="projector-body-inner">
            <div className="projector-sections-pane">
              <SectionNav
                sections={PROJECTOR_SECTIONS}
                activeSection={activeSection}
                selectedSection={selectedSection}
                onSectionHover={handleSectionHover}
                onSectionBlur={() => setHoveredSection(null)}
                onSectionClick={handleSectionClick}
              />
            </div>

            <div className="projector-topics-pane">
              <section
                className={`projector-topic-stage${isMorphingTopics ? " is-morphing" : ""}`}
                aria-label={`${displayedSection} topics`}
                ref={topicStageRef}
              >
                {/*
                  The SVG threshold filter is applied to the morph wrapper via CSS.
                  JS blurs/fades the old/new full content layers (Valgo technique).
                */}
                <div className={`projector-topic-morph${isMorphingTopics ? " is-morphing" : ""}`}>
                  {isMorphingTopics ? (
                    <>
                      <TopicLayer
                        section={morphFromSection}
                        topicEntries={PROJECTOR_TOPICS[morphFromSection] ?? []}
                        activeTopic={activeTopic}
                        layerClassName="projector-topic-layer--from"
                        layerRef={morphFromLayerRef}
                        layerKey={`from-${morphFromSection}`}
                        onTopicEnter={setHoveredTopic}
                        onTopicLeave={() => setHoveredTopic(null)}
                        onSubtopicEnter={startSubtopicPan}
                        onSubtopicLeave={stopSubtopicPan}
                        onSubtopicActivate={navigateToSubtopicRoute}
                      />
                      <TopicLayer
                        section={morphToSection}
                        topicEntries={PROJECTOR_TOPICS[morphToSection] ?? []}
                        activeTopic={activeTopic}
                        layerClassName="projector-topic-layer--to"
                        layerRef={morphToLayerRef}
                        layerKey={`to-${morphToSection}`}
                        onTopicEnter={setHoveredTopic}
                        onTopicLeave={() => setHoveredTopic(null)}
                        onSubtopicEnter={startSubtopicPan}
                        onSubtopicLeave={stopSubtopicPan}
                        onSubtopicActivate={navigateToSubtopicRoute}
                      />
                    </>
                  ) : (
                    <TopicLayer
                      section={displayedSection}
                      topicEntries={PROJECTOR_TOPICS[displayedSection] ?? []}
                      activeTopic={activeTopic}
                      layerClassName="projector-topic-layer--current"
                      layerRef={null}
                      layerKey={`current-${displayedSection}`}
                      onTopicEnter={setHoveredTopic}
                      onTopicLeave={() => setHoveredTopic(null)}
                      onSubtopicEnter={startSubtopicPan}
                      onSubtopicLeave={stopSubtopicPan}
                      onSubtopicActivate={navigateToSubtopicRoute}
                    />
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        <button
          className={`projector-rope${isRopeGrabbed ? " is-grabbed" : ""}`}
          type="button"
          onPointerDown={startRopeDrag}
          onPointerMove={moveRopeDrag}
          onPointerUp={(e) => endRopeDrag(e, true)}
          onPointerCancel={(e) => endRopeDrag(e, false)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleProjectorScreen(); } }}
          aria-pressed={isOpenLike}
          aria-label={isOpenLike ? "Roll up projector screen" : "Pull down projector screen"}
        >
          <span className="projector-pull" />
        </button>
      </header>

      {routeStatus === "home" ? <HomePage /> : null}
      {routeStatus === "coming-soon" || routeStatus === "not-found" ? (
        <PageNotFound isComingSoon={routeStatus === "coming-soon"} />
      ) : null}

      {/* SVG threshold filter — the secret ingredient of the Valgo gooey morph.
          Individual text nodes are blurred, then this filter snaps alpha edges. */}
      <svg className="morph-filters" aria-hidden="true" focusable="false">
        <defs>
          <filter id="topic-morph-threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -120"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

export default Navbar;
