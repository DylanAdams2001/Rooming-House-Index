import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Bypasses RLS entirely — only for server-side webhook routes that run with no
// user session (Supabase Database Webhooks call these as plain HTTP requests),
// where there's no auth.uid() for RLS to key off in the first place. Never
// import this into anything reachable from a request that carries user input
// without its own authorization check, and never expose SUPABASE_SERVICE_ROLE_KEY
// to the client.
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
