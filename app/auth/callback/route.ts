import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase redirects here after a successful Google OAuth login (see
// supabase.auth.signInWithOAuth in components/auth-form.tsx). Exchanges the
// auth code for a session, then sends the user wherever they were headed —
// same `redirectTo` idea used by the Enquire -> signup flow.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo");
  const destination = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // Only ever allow this to set 'tenant', and only on a fresh signup that's still
    // sitting at the default 'investor' role — never let a client-controlled query
    // param grant 'provider' or 'admin'.
    const role = searchParams.get("role");
    if (role === "tenant" && data.user) {
      await supabase
        .from("users")
        .update({ role: "tenant" })
        .eq("id", data.user.id)
        .eq("role", "investor");
    }
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
