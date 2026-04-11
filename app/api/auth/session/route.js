import { NextResponse } from "next/server";
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  serializeUser,
} from "@/src/lib/auth/request";
import { createNoStoreHeaders } from "@/src/lib/supabase/config";
import { createRouteHandlerSupabaseClient } from "@/src/lib/supabase/server";

function createErrorResponse(message, status, headers) {
  return NextResponse.json(
    { error: message, authenticated: false, user: null },
    { status, headers: createNoStoreHeaders(headers) }
  );
}

export async function GET() {
  let supabaseContext;

  try {
    supabaseContext = await createRouteHandlerSupabaseClient();
  } catch {
    return createErrorResponse(SUPABASE_CONFIG_ERROR_MESSAGE, 500);
  }

  const { supabase, responseHeaders } = supabaseContext;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      {
        status: 200,
        headers: responseHeaders,
      }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: serializeUser(user),
    },
    {
      status: 200,
      headers: responseHeaders,
    }
  );
}
