import React, { useEffect, useRef, useState } from "react";
import { PROJECTOR_SECTIONS, PROJECTOR_TOPICS } from "../engine/Lessons";
import {
  SECTION_SLUGS,
  buildLessonPath,
  parseLessonPath,
  findLessonBySlugs,
  stripBasePath,
  withBasePath,
} from "../engine/lessonRouting";
import HomePage from "../views/HomePage";
import MissionPage from "../views/MissionPage";
import ContactPage from "../views/ContactPage";
import DonatePage from "../views/DonatePage";
import PageNotFound from "../views/PageNotFound";
import SectionNav from "./SectionNav";
import TopicLayer from "./TopicLayer";

const OPEN_MS = 900;
const CLOSE_MS = 680;
const TOPIC_MORPH_TIME_MS = 820;
const TOPIC_SLIDE_TIME_MS = 560;
const MORPH_BLUR_BASE = 5;
const MORPH_MAX_BLUR_PX = 22;
const MORPH_OPACITY_EXPONENT = 0.1;
const TOPBAR_TEXT_LINKS = [
  { slug: "mission", label: "Mission" },
  { slug: "contact", label: "Contact" },
  { slug: "donate", label: "Donate" },
];
const TOP_ROUTE_STATUSES = {
  mission: "mission",
  contact: "contact",
  donate: "donate",
  account: "account",
};
const STACKABLE_ROUTE_STATUSES = new Set([
  "home",
  "mission",
  "contact",
  "donate",
  "account",
  "coming-soon",
  "not-found",
]);
const MAX_DEALT_CARDS = 18;

function resolveTopicTransitionMode() {
  if (typeof window === "undefined") {
    return "gooey";
  }

  const { userAgent, vendor = "" } = window.navigator;
  const isSafari =
    /Safari/i.test(userAgent) &&
    /Apple/i.test(vendor) &&
    !/Chrome|Chromium|CriOS|EdgiOS|FxiOS|OPiOS|DuckDuckGo/i.test(userAgent);

  return isSafari ? "slide" : "gooey";
}

function getPathSegments(pathname) {
  const relativePath = stripBasePath(pathname);

  return relativePath
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

  if (pathSegments.length === 1) {
    const [routeSlug] = pathSegments;
    if (TOP_ROUTE_STATUSES[routeSlug]) {
      return { status: TOP_ROUTE_STATUSES[routeSlug], matchedLesson: null };
    }
    if (SECTION_SLUGS.has(routeSlug)) {
      return { status: "coming-soon", matchedLesson: null };
    }
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

function Navbar({ initialPathname: initialPathnameProp = null }) {
  const initialPathname =
    initialPathnameProp ?? (typeof window === "undefined" ? "/" : window.location.pathname);
  const initialRouteStatus = resolvePathStatus(initialPathname).status;
  const [topicTransitionMode] = useState(resolveTopicTransitionMode);
  const [screenPhase, setScreenPhase] = useState("closed");
  const [selectedSection, setSelectedSection] = useState(PROJECTOR_SECTIONS[0]);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [displayedSection, setDisplayedSection] = useState(PROJECTOR_SECTIONS[0]);
  const [isMorphingTopics, setIsMorphingTopics] = useState(false);
  const [morphFromSection, setMorphFromSection] = useState(PROJECTOR_SECTIONS[0]);
  const [morphToSection, setMorphToSection] = useState(PROJECTOR_SECTIONS[0]);
  const [topicSlideDirection, setTopicSlideDirection] = useState(1);
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const [activePathname, setActivePathname] = useState(initialPathname);
  const [routeStatus, setRouteStatus] = useState(initialRouteStatus);
  const [dealtCards, setDealtCards] = useState(() => [
    {
      id: 0,
      status: initialRouteStatus,
      path: stripBasePath(initialPathname) || "/",
    },
  ]);

  const timerRef = useRef(null);
  const morphFrameRef = useRef(null);
  const morphTimerRef = useRef(null);
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

  const syncSubtopicOverflowState = (item) => {
    if (!item) return false;

    const viewport = item.querySelector(".projector-subtopic-viewport");
    const measureText = item.querySelector(".projector-subtopic-measure");
    const primaryText = item.querySelector(".projector-subtopic-text--primary");
    if (!viewport) return false;

    const measuredWidth = Math.max(
      Math.ceil(measureText?.getBoundingClientRect().width ?? 0),
      Math.ceil(measureText?.scrollWidth ?? 0),
      Math.ceil(primaryText?.scrollWidth ?? 0)
    );
    const viewportWidth = Math.ceil(
      viewport.getBoundingClientRect().width || viewport.clientWidth || 0
    );
    const overflowPx = measuredWidth - viewportWidth;

    if (overflowPx > 1) {
      item.classList.add("is-overflowing");
      const panGapPx = 26;
      const loopDistancePx = measuredWidth + panGapPx;
      item.style.setProperty("--subtopic-pan-gap", `${panGapPx}px`);
      item.style.setProperty("--subtopic-pan-loop-distance", `${loopDistancePx}px`);
      const durationMs = Math.min(Math.max(loopDistancePx * 22, 2400), 12000);
      item.style.setProperty("--subtopic-pan-duration", `${durationMs}ms`);
      return true;
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
    return false;
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
    if (!syncSubtopicOverflowState(item)) return;
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

  const clearMorphTimer = () => {
    if (morphTimerRef.current) {
      clearTimeout(morphTimerRef.current);
      morphTimerRef.current = null;
    }
  };

  useEffect(() => () => {
    clearPhaseTimer();
    clearMorphTimer();
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
        syncSubtopicOverflowState(item);
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
  const activePathSegments = getPathSegments(activePathname);
  const isHomeRoute = activePathSegments.length === 0;
  const isAccountRoute = isAccountPath(activePathname);

  const syncStateFromPath = (pathname) => {
    setActivePathname(pathname);
    const { status, matchedLesson } = resolvePathStatus(pathname);
    setRouteStatus(status);
    if (STACKABLE_ROUTE_STATUSES.has(status)) {
      const path = stripBasePath(pathname) || "/";
      setDealtCards((currentCards) => {
        const topCard = currentCards[currentCards.length - 1];
        if (topCard && topCard.status === status && topCard.path === path) {
          return currentCards;
        }

        const topId = topCard ? topCard.id : -1;
        const nextCards = [
          ...currentCards,
          { id: topId + 1, status, path },
        ];
        return nextCards.slice(-MAX_DEALT_CARDS);
      });
    }
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
    const nextPath = withBasePath("/");
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    syncStateFromPath(nextPath);
    if (isOpenLikeNow()) {
      closeProjectorScreen();
    }
  };

  const navigateTopRoute = (routePath) => {
    const nextPath = withBasePath(routePath);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    syncStateFromPath(nextPath);
    if (isOpenLikeNow()) {
      closeProjectorScreen();
    }
  };

  const navigateAccount = () => {
    const nextPath = withBasePath("/account");
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
    clearMorphTimer();
    if (morphFrameRef.current) { cancelAnimationFrame(morphFrameRef.current); morphFrameRef.current = null; }

    const fromIndex = PROJECTOR_SECTIONS.indexOf(fromSection);
    const toIndex = PROJECTOR_SECTIONS.indexOf(toSection);
    setTopicSlideDirection(toIndex >= fromIndex ? 1 : -1);
    morphStateRef.current = { status: "morphing", from: fromSection, to: toSection };
    setMorphFromSection(fromSection);
    setMorphToSection(toSection);
    setIsMorphingTopics(true);
    isMorphingTopicsRef.current = true;
    morphStartRef.current = 0;

    if (topicTransitionMode === "slide") {
      morphTimerRef.current = setTimeout(() => {
        morphTimerRef.current = null;
        setDisplayedSection(toSection); displayedSectionRef.current = toSection;
        setIsMorphingTopics(false); isMorphingTopicsRef.current = false;
        morphStateRef.current = { status: "idle", from: toSection, to: toSection };

        const queued = morphTargetSectionRef.current;
        if (queued !== toSection) beginTopicMorph(toSection, queued);
      }, TOPIC_SLIDE_TIME_MS);
      return;
    }

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

  const isSlideMorph = isMorphingTopics && topicTransitionMode === "slide";
  const isGooeyMorph = isMorphingTopics && topicTransitionMode === "gooey";
  const topicStageStyle = {
    "--projector-topic-slide-direction": topicSlideDirection,
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
            className={`topbar-text-btn topbar-home-btn${isHomeRoute ? " is-active" : ""}`}
            aria-pressed={isHomeRoute}
            onClick={navigateHome}
          >
            Home
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
            className={`topbar-text-btn topbar-account-btn${isAccountRoute ? " is-active" : ""}`}
            aria-pressed={isAccountRoute}
            onClick={navigateAccount}
          >
            Account
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
                className={`projector-topic-stage${isMorphingTopics ? " is-morphing" : ""}${
                  isSlideMorph ? " is-slide-morph" : ""
                }${isGooeyMorph ? " is-gooey-morph" : ""}`}
                aria-label={`${displayedSection} topics`}
                ref={topicStageRef}
                style={topicStageStyle}
              >
                {/*
                  JS blurs/fades the old/new full content layers (Valgo technique).
                  CSS applies the SVG threshold on an outer shell and a light blur on
                  the inner wrapper so Safari does not have to chain both filters on
                  the same element.
                */}
                <div
                  className={`projector-topic-morph-shell${isGooeyMorph ? " is-morphing" : ""}${
                    isSlideMorph ? " is-slide-morph" : ""
                  }`}
                >
                  <div
                    className={`projector-topic-morph${isGooeyMorph ? " is-morphing" : ""}${
                      isSlideMorph ? " is-slide-morph" : ""
                    }`}
                  >
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
                </div>
              </section>
            </div>
          </div>
        </div>

        <button
          className="projector-rope"
          type="button"
          onClick={toggleProjectorScreen}
          aria-pressed={isOpenLike}
          aria-label={isOpenLike ? "Roll up projector screen" : "Pull down projector screen"}
        >
          <span className="projector-pull" />
        </button>
      </header>

      <div className="info-card-deck">
        {dealtCards.map((card, index) => (
          <div key={card.id} className="info-card-deck-layer" style={{ zIndex: index + 1 }}>
            {card.status === "home" && <HomePage dealIndex={card.id} />}
            {card.status === "mission" && <MissionPage dealIndex={card.id} />}
            {card.status === "contact" && <ContactPage dealIndex={card.id} />}
            {card.status === "donate" && <DonatePage dealIndex={card.id} />}
            {card.status === "account" && (
              <PageNotFound isComingSoon={true} dealIndex={card.id} />
            )}
            {card.status !== "home" &&
              card.status !== "mission" &&
              card.status !== "contact" &&
              card.status !== "account" &&
              card.status !== "donate" && (
                <PageNotFound isComingSoon={card.status === "coming-soon"} dealIndex={card.id} />
              )}
          </div>
        ))}
      </div>

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
