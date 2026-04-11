import { NextResponse } from "next/server";
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  readJsonBody,
  serializeUser,
  validateLoginPayload,
  validateSameOriginRequest,
} from "@/src/lib/auth/request";
import { createNoStoreHeaders } from "@/src/lib/supabase/config";
import { createRouteHandlerSupabaseClient } from "@/src/lib/supabase/server";

function createErrorResponse(message, status, headers) {
  return NextResponse.json(
    { error: message },
    { status, headers: createNoStoreHeaders(headers) }
  );
}

function getLoginErrorResponse(error, headers) {
  if (error?.status === 429 || /rate limit/i.test(error?.message || "")) {
    return createErrorResponse("Too many login attempts. Please wait and try again.", 429, headers);
  }

  if (/email not confirmed/i.test(error?.message || "")) {
    return createErrorResponse("Please confirm your email before logging in.", 403, headers);
  }

  return createErrorResponse("Invalid email or password.", 401, headers);
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

  const validation = validateLoginPayload(payload);

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
  const { data, error } = await supabase.auth.signInWithPassword(validation.data);

  if (error) {
    return getLoginErrorResponse(error, responseHeaders);
  }

  return NextResponse.json(
    {
      user: serializeUser(data.user),
    },
    {
      status: 200,
      headers: responseHeaders,
    }
  );
}
