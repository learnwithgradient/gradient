import { withBasePath } from "../basePath";

const DEFAULT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
};

function resolvePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const publishableKey = resolvePublishableKey();

  return {
    isConfigured: Boolean(url && publishableKey),
    url,
    publishableKey,
    cookieOptions: {
      name: "gradient-auth",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: withBasePath("/"),
      maxAge: DEFAULT_COOKIE_MAX_AGE_SECONDS,
    },
  };
}

export function getSupabaseCookieWriteOptions(options = {}) {
  const { cookieOptions } = getSupabaseConfig();

  return {
    ...options,
    httpOnly: true,
    sameSite: "lax",
    secure: cookieOptions.secure,
    path: cookieOptions.path,
  };
}

export function createNoStoreHeaders(init) {
  const headers = new Headers(init);

  Object.entries(NO_STORE_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return headers;
}
