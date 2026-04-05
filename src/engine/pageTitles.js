import { PROJECTOR_SECTIONS } from "./Lessons";
import { findLessonBySlugs, parseLessonPath, stripBasePath } from "./lessonRouting";

const TOP_ROUTE_TITLE_LABELS = {
  "": "Home",
  mission: "Mission",
  contact: "Contact",
  donate: "Donate",
  account: "Account",
};

function getPathSegments(pathname) {
  const relativePath = stripBasePath(pathname);

  return relativePath
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}

function formatSlugLabel(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function resolveSectionTitleLabel(sectionSlug) {
  const matchingSection = PROJECTOR_SECTIONS.find(
    (section) => formatSlugLabel(section.toLowerCase().replace(/\s+/g, "-")) === formatSlugLabel(sectionSlug)
  );

  return matchingSection ?? formatSlugLabel(sectionSlug);
}

export function getPageTitleLabel(pathname) {
  const pathSegments = getPathSegments(pathname);

  if (pathSegments.length <= 1) {
    const routeSlug = pathSegments[0] ?? "";
    if (TOP_ROUTE_TITLE_LABELS[routeSlug]) {
      return TOP_ROUTE_TITLE_LABELS[routeSlug];
    }

    if (routeSlug) {
      return resolveSectionTitleLabel(routeSlug);
    }
  }

  const parsedPath = parseLessonPath(pathname);
  if (!parsedPath) {
    return "Not Found";
  }

  const matchedLesson = findLessonBySlugs(
    parsedPath.sectionSlug,
    parsedPath.topicSlug,
    parsedPath.subtopicSlug
  );

  if (!matchedLesson) {
    return "Not Found";
  }

  return matchedLesson.subtopic;
}

export function getDocumentTitle(pathname) {
  return `${getPageTitleLabel(pathname)} | Gradient`;
}
