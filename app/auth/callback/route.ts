import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appendRedirectTo, defaultDestination, getOnboardingPath } from "@/lib/onboarding";

// Supabase redirects here after a successful Google OAuth login (see
// supabase.auth.signInWithOAuth in components/auth-form.tsx). Exchanges the
// auth code for a session, then sends the user wherever they were headed —
// same `redirectTo` idea used by the Enquire -> signup flow.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectToParam = searchParams.get("redirectTo");
  const explicitDestination =
    redirectToParam && redirectToParam.startsWith("/") ? redirectToParam : null;

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_step, investor_access")
        .eq("id", data.user.id)
        .maybeSingle();

      const onboardingPath = getOnboardingPath(profile?.onboarding_step);
      if (onboardingPath) {
        return NextResponse.redirect(
          `${origin}${appendRedirectTo(onboardingPath, explicitDestination)}`
        );
      }
      return NextResponse.redirect(
        `${origin}${explicitDestination ?? defaultDestination(profile?.investor_access)}`
      );
    }
  }

  return NextResponse.redirect(`${origin}${explicitDestination ?? "/account"}`);
}
