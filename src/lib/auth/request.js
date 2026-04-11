import { withBasePath } from "../basePath";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 320;
const MAX_PASSWORD_LENGTH = 1024;

export const SUPABASE_CONFIG_ERROR_MESSAGE =
  "Supabase auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";

function getRequestOrigin(request) {
  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
}

function getConfiguredSiteOrigin() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    return null;
  }

  try {
    return new URL(siteUrl).origin;
  } catch {
    return null;
  }
}

export function resolveRequestOrigin(request) {
  return getRequestOrigin(request) ?? getConfiguredSiteOrigin();
}

export function buildAbsoluteUrl(request, path = "/") {
  const origin = getConfiguredSiteOrigin() ?? getRequestOrigin(request);
  return new URL(withBasePath(path), origin).toString();
}

export function getSafeNextPath(nextPath, fallbackPath = "/account") {
  const safeFallback = withBasePath(fallbackPath);

  if (!nextPath || typeof nextPath !== "string") {
    return safeFallback;
  }

  try {
    const resolved = new URL(nextPath, "http://gradient.local");

    if (resolved.origin !== "http://gradient.local") {
      return safeFallback;
    }

    return withBasePath(`${resolved.pathname}${resolved.search}${resolved.hash}`);
  } catch {
    return safeFallback;
  }
}

export function validateSameOriginRequest(request) {
  const origin = request.headers.get("origin");

  if (!origin || origin === "null") {
    return "Invalid request origin.";
  }

  const allowedOrigins = new Set(
    [getConfiguredSiteOrigin(), getRequestOrigin(request)].filter(Boolean)
  );

  return allowedOrigins.has(origin) ? null : "Invalid request origin.";
}

export async function readJsonBody(request) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("Requests must use application/json.");
  }

  try {
    return await request.json();
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function normalizePassword(password) {
  return typeof password === "string" ? password : "";
}

function isValidEmail(email) {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}

function isValidPassword(password) {
  return password.length > 0 && password.length <= MAX_PASSWORD_LENGTH;
}

export function validateLoginPayload(payload) {
  const email = normalizeEmail(payload?.email);
  const password = normalizePassword(payload?.password);

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!isValidPassword(password)) {
    return { error: "Please enter a valid password." };
  }

  return {
    data: {
      email,
      password,
    },
  };
}

export function validateSignupPayload(payload) {
  const email = normalizeEmail(payload?.email);
  const password = normalizePassword(payload?.password);
  const confirmPassword = normalizePassword(payload?.confirmPassword);

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!isValidPassword(password)) {
    return { error: "Please enter a valid password." };
  }

  if (!confirmPassword) {
    return { error: "Please confirm your password." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  return {
    data: {
      email,
      password,
    },
  };
}

export function serializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    lastSignInAt: user.last_sign_in_at ?? null,
  };
}
