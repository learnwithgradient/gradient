import { NextResponse } from "next/server";
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
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

export async function POST(request) {
  const originError = validateSameOriginRequest(request);

  if (originError) {
    return createErrorResponse(originError, 403);
  }

  let supabaseContext;

  try {
    supabaseContext = await createRouteHandlerSupabaseClient();
  } catch {
    return createErrorResponse(SUPABASE_CONFIG_ERROR_MESSAGE, 500);
  }

  const { supabase, responseHeaders } = supabaseContext;
  const { error } = await supabase.auth.signOut();

  if (error) {
    return createErrorResponse("Unable to log out right now.", 400, responseHeaders);
  }

  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: responseHeaders,
    }
  );
}
