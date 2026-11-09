import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

let admin: SupabaseClient | undefined;

/** Service-role client. Bypasses Supabase access rules: server use only. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!admin) {
    const env = getServerEnv();
    admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}
