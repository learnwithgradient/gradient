const RAW_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/";
const BASE_PATH =
  RAW_BASE_PATH === "/" ? "" : `/${RAW_BASE_PATH.replace(/^\/|\/$/g, "")}`;

export function getBasePath() {
  return BASE_PATH;
}

export function withBasePath(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!BASE_PATH) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `${BASE_PATH}/`;
  }

  if (normalizedPath === BASE_PATH || normalizedPath.startsWith(`${BASE_PATH}/`)) {
    return normalizedPath;
  }

  return `${BASE_PATH}${normalizedPath}`;
}

export function stripBasePath(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (!BASE_PATH) {
    return normalizedPath;
  }

  if (normalizedPath === BASE_PATH || normalizedPath === `${BASE_PATH}/`) {
    return "/";
  }

  if (normalizedPath.startsWith(`${BASE_PATH}/`)) {
    return normalizedPath.slice(BASE_PATH.length);
  }

  return normalizedPath;
}
