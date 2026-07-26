// Supabase Database Webhooks let you attach custom HTTP headers when you create
// the hook in the dashboard — this checks that whatever secret was configured
// there matches, so these routes can't be triggered by an arbitrary POST from
// anyone who finds the URL.
export function isValidWebhookRequest(req: Request): boolean {
  const expected = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!expected) return false;
  return req.headers.get("x-webhook-secret") === expected;
}
