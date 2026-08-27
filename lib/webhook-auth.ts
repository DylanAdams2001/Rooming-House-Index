// Supabase Database Webhooks let you attach custom HTTP headers when you create
// the hook in the dashboard — this checks that whatever secret was configured
// there matches, so these routes can't be triggered by an arbitrary POST from
// anyone who finds the URL.
//
// envVar defaults to the shared SUPABASE_WEBHOOK_SECRET every existing
// webhook route already uses — pass a different env var name for a route
// that needs its own dedicated secret instead (e.g. one set up later, where
// reusing the shared secret would mean rotating it and breaking every other
// already-configured webhook that still has the old value baked in).
export function isValidWebhookRequest(req: Request, envVar: string = "SUPABASE_WEBHOOK_SECRET"): boolean {
  const expected = process.env[envVar];
  if (!expected) return false;
  return req.headers.get("x-webhook-secret") === expected;
}
