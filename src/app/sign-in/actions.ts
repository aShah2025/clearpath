"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SignInState = { status: "idle" | "sent" | "error"; message?: string };

const emailSchema = z.email();

export async function sendSignInLink(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) return { status: "error", message: "Please enter a valid email address." };

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });
    if (error) {
      console.error("[auth] Sign-in link failed", { status: error.status });
      return { status: "error", message: "We couldn't send the link. Please try again in a minute." };
    }
    return { status: "sent" };
  } catch (error) {
    console.error("[auth] Sign-in link failed", error);
    return { status: "error", message: "Sign-in isn't available right now. Please try again later." };
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[auth] Sign-out failed", error);
  }
  redirect("/");
}
