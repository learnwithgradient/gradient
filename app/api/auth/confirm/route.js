import { NextResponse } from "next/server";
import { buildAbsoluteUrl, getSafeNextPath } from "@/src/lib/auth/request";
import { createRouteHandlerSupabaseClient } from "@/src/lib/supabase/server";

const ALLOWED_EMAIL_OTP_TYPES = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));
  const redirectUrl = new URL(nextPath, buildAbsoluteUrl(request, "/"));

  if (!tokenHash || !type || !ALLOWED_EMAIL_OTP_TYPES.has(type)) {
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const { supabase, responseHeaders } = await createRouteHandlerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return NextResponse.redirect(redirectUrl, {
        headers: responseHeaders,
      });
    }

    return NextResponse.redirect(redirectUrl, {
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.redirect(redirectUrl);
  }
}
