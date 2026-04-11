import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  createNoStoreHeaders,
  getSupabaseConfig,
  getSupabaseCookieWriteOptions,
} from "./config";

function createCookieAdapter(cookieStore, { onSetAll = null } = {}) {
  return {
    encode: "tokens-only",
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet, headers = {}) {
      if (!onSetAll) {
        return;
      }

      onSetAll(cookiesToSet, headers);
    },
  };
}

function hasSupabaseSessionCookie(cookieStore, cookieName) {
  return cookieStore
    .getAll()
    .some(
      ({ name }) =>
        name === cookieName || name.startsWith(`${cookieName}.`) || name.startsWith(`${cookieName}-`)
    );
}

export async function createRouteHandlerSupabaseClient(initHeaders) {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    throw new Error("Supabase auth is not configured.");
  }

  const responseHeaders = createNoStoreHeaders(initHeaders);
  const cookieStore = await cookies();

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookieOptions: config.cookieOptions,
    cookies: createCookieAdapter(cookieStore, {
      onSetAll(cookiesToSet, headers = {}) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, getSupabaseCookieWriteOptions(options));
        });

        Object.entries(headers).forEach(([key, value]) => {
          responseHeaders.set(key, value);
        });
      },
    }),
  });

  return { supabase, responseHeaders };
}

export async function createServerComponentSupabaseClient(cookieStoreOverride = null) {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    throw new Error("Supabase auth is not configured.");
  }

  const cookieStore = cookieStoreOverride ?? (await cookies());

  return createServerClient(config.url, config.publishableKey, {
    cookieOptions: config.cookieOptions,
    cookies: createCookieAdapter(cookieStore),
  });
}

export async function getServerAuthStatus() {
  try {
    const config = getSupabaseConfig();

    if (!config.isConfigured) {
      return "anonymous";
    }

    const cookieStore = await cookies();

    if (!hasSupabaseSessionCookie(cookieStore, config.cookieOptions.name)) {
      return "anonymous";
    }

    const supabase = await createServerComponentSupabaseClient(cookieStore);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return "anonymous";
    }

    return "authenticated";
  } catch {
    return "anonymous";
  }
}
