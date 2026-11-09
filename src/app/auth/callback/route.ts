import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Finishes a magic-link sign-in. The destination is fixed to avoid open redirects. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  try {
    if (code) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL("/dashboard", url.origin));
      console.error("[auth] Code exchange failed", { status: error.status });
    }
  } catch (error) {
    console.error("[auth] Callback failed", error);
  }
  return NextResponse.redirect(new URL("/sign-in?error=link", url.origin));
}
