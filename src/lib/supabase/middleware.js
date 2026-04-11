import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseConfig, getSupabaseCookieWriteOptions } from "./config";

export async function updateSession(request) {
  const config = getSupabaseConfig();
  let response = NextResponse.next({
    request,
  });

  if (!config.isConfigured) {
    return response;
  }

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookieOptions: config.cookieOptions,
    cookies: {
      encode: "tokens-only",
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers = {}) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, getSupabaseCookieWriteOptions(options));
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  await supabase.auth.getClaims();

  return response;
}
