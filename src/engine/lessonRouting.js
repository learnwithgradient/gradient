import { PROJECTOR_SECTIONS, PROJECTOR_TOPICS } from "./Lessons";

const RAW_BASE_URL = process.env.NEXT_PUBLIC_BASE_PATH || "/";
const BASE_PREFIX = RAW_BASE_URL === "/" ? "" : `/${RAW_BASE_URL.replace(/^\/|\/$/g, "")}`;

export const toKebabCase = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const withBasePath = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!BASE_PREFIX) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `${BASE_PREFIX}/`;
  }

  return `${BASE_PREFIX}${normalizedPath}`;
};

export const stripBasePath = (pathname = "/") => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (!BASE_PREFIX) {
    return normalizedPath;
  }

  if (normalizedPath === BASE_PREFIX || normalizedPath === `${BASE_PREFIX}/`) {
    return "/";
  }

  if (normalizedPath.startsWith(`${BASE_PREFIX}/`)) {
    return normalizedPath.slice(BASE_PREFIX.length);
  }

  return normalizedPath;
};

export const buildLessonPath = (section, topic, subtopic) =>
  withBasePath(`/${[section, topic, subtopic].map(toKebabCase).join("/")}`);

export const SECTION_SLUGS = new Set(PROJECTOR_SECTIONS.map(toKebabCase));

export const parseLessonPath = (pathname) => {
  const relativePath = stripBasePath(pathname);

  const segments = relativePath
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));

  if (segments.length !== 3) {
    return null;
  }

  const [sectionSlug, topicSlug, subtopicSlug] = segments.slice(-3);
  return { sectionSlug, topicSlug, subtopicSlug };
};

export const findLessonBySlugs = (sectionSlug, topicSlug, subtopicSlug) => {
  for (const section of PROJECTOR_SECTIONS) {
    if (toKebabCase(section) !== sectionSlug) continue;

    const topicEntries = PROJECTOR_TOPICS[section] ?? [];
    for (const topicEntry of topicEntries) {
      if (toKebabCase(topicEntry.topic) !== topicSlug) continue;

      const matchedSubtopic = topicEntry.subtopics.find(
        (subtopic) => toKebabCase(subtopic) === subtopicSlug
      );
      if (!matchedSubtopic) continue;

      return {
        section,
        topic: topicEntry.topic,
        subtopic: matchedSubtopic,
      };
    }
  }

  return null;
};
