import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/env";

/**
 * Service-role client — bypasses RLS. Only use it server-side for the
 * admin-only endpoints, and only after the caller has been authenticated.
 * Returns `null` when the service role key is not configured.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  if (supabaseServiceRoleKey.includes("your-service-role-key")) return null;

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
