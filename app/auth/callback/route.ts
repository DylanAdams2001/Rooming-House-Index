import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appendRedirectTo, defaultDestination, getOnboardingPath } from "@/lib/onboarding";
import { createProviderListing } from "@/lib/provider-signup";

// Supabase redirects here after a successful Google OAuth login (see
// supabase.auth.signInWithOAuth in components/auth-form.tsx). Exchanges the
// auth code for a session, then sends the user wherever they were headed —
// same `redirectTo` idea used by the Enquire -> signup flow.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectToParam = searchParams.get("redirectTo");
  const assignRole = searchParams.get("assignRole");
  const providerCategoryValue = searchParams.get("providerCategoryValue");
  const providerCategoryLabel = searchParams.get("providerCategoryLabel");
  const referralCode = searchParams.get("ref");
  const explicitDestination =
    redirectToParam && redirectToParam.startsWith("/") ? redirectToParam : null;

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      // Google's OAuth profile includes a photo — use it as the default
      // avatar so users don't have to re-upload one they already have.
      // Guarded to never overwrite a photo they've since set/changed
      // themselves (e.g. via /onboarding/photo or /account/settings).
      const googleAvatarUrl =
        (data.user.user_metadata?.avatar_url as string | undefined) ??
        (data.user.user_metadata?.picture as string | undefined) ??
        null;
      if (googleAvatarUrl) {
        await supabase
          .from("users")
          .update({ avatar_url: googleAvatarUrl })
          .eq("id", data.user.id)
          .is("avatar_url", null);
      }

      if (referralCode) {
        const { data: referrerId } = await supabase.rpc("resolve_referrer_id", {
          p_referral_code: referralCode,
        });
        if (referrerId && referrerId !== data.user.id) {
          await supabase
            .from("users")
            .update({ referred_by: referrerId })
            .eq("id", data.user.id)
            .is("referred_by", null);
        }
      }

      // Private, hand-sent signup links (e.g. /signup/property-manager) carry this
      // through so Google OAuth signups land in /partners with the right role too,
      // same as the email/password path in components/auth-form.tsx.
      if (providerCategoryValue && providerCategoryLabel) {
        await createProviderListing(
          supabase,
          data.user.id,
          data.user.email ?? "",
          assignRole ?? "provider",
          providerCategoryValue,
          providerCategoryLabel
        );
        return NextResponse.redirect(`${origin}/partners/profile`);
      }

      if (assignRole) {
        await supabase.from("users").update({ role: assignRole }).eq("id", data.user.id);
        return NextResponse.redirect(`${origin}/partners`);
      }

      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_step, investor_access, role")
        .eq("id", data.user.id)
        .maybeSingle();

      const onboardingPath = getOnboardingPath(profile?.onboarding_step);
      if (onboardingPath) {
        return NextResponse.redirect(
          `${origin}${appendRedirectTo(onboardingPath, explicitDestination)}`
        );
      }
      return NextResponse.redirect(
        `${origin}${
          explicitDestination ?? defaultDestination(profile?.investor_access, profile?.role)
        }`
      );
    }
  }

  return NextResponse.redirect(`${origin}${explicitDestination ?? "/account"}`);
}
