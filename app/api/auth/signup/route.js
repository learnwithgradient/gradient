import { NextResponse } from "next/server";
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  buildAbsoluteUrl,
  readJsonBody,
  validateSameOriginRequest,
  validateSignupPayload,
} from "@/src/lib/auth/request";
import { createNoStoreHeaders } from "@/src/lib/supabase/config";
import { createRouteHandlerSupabaseClient } from "@/src/lib/supabase/server";

function createErrorResponse(message, status, headers) {
  return NextResponse.json(
    { error: message },
    { status, headers: createNoStoreHeaders(headers) }
  );
}

function createAcceptedSignupResponse(headers) {
  return NextResponse.json(
    { accepted: true },
    { status: 200, headers: createNoStoreHeaders(headers) }
  );
}

function getSignupErrorResponse(error, headers) {
  if (error?.status === 429 || /rate limit/i.test(error?.message || "")) {
    return createErrorResponse(
      "Too many signup attempts. Please wait a moment and try again.",
      429,
      headers
    );
  }

  if (/already registered/i.test(error?.message || "")) {
    return createAcceptedSignupResponse(headers);
  }

  return createErrorResponse(error?.message || "Unable to create account.", 400, headers);
}

export async function POST(request) {
  const originError = validateSameOriginRequest(request);

  if (originError) {
    return createErrorResponse(originError, 403);
  }

  let payload;

  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return createErrorResponse(error.message, 400);
  }

  const validation = validateSignupPayload(payload);

  if (validation.error) {
    return createErrorResponse(validation.error, 400);
  }

  let supabaseContext;

  try {
    supabaseContext = await createRouteHandlerSupabaseClient();
  } catch {
    return createErrorResponse(SUPABASE_CONFIG_ERROR_MESSAGE, 500);
  }

  const { supabase, responseHeaders } = supabaseContext;
  const { data, error } = await supabase.auth.signUp({
    ...validation.data,
    options: {
      emailRedirectTo: buildAbsoluteUrl(request, "/api/auth/confirm?next=/account"),
    },
  });

  if (error) {
    return getSignupErrorResponse(error, responseHeaders);
  }

  if (data.session) {
    await supabase.auth.signOut();
  }

  return createAcceptedSignupResponse(responseHeaders);
}
