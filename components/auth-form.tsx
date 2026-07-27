"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { appendRedirectTo, defaultDestination, getOnboardingPath } from "@/lib/onboarding";
import { createProviderListing } from "@/lib/provider-signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({
  mode,
  redirectTo,
  onAuthenticated,
  onSwitchMode,
  signupRole,
  signupProviderCategory,
}: {
  mode: "login" | "signup";
  redirectTo?: string;
  // When provided (e.g. embedded in AuthModal), skip the normal page-navigation
  // behavior entirely and just hand back the authenticated user id — the caller
  // decides what happens next without losing whatever page they were already on.
  onAuthenticated?: (userId: string) => void;
  // When provided, the "log in instead / sign up instead" link toggles in place
  // (e.g. inside a modal) rather than navigating to /login or /signup.
  onSwitchMode?: () => void;
  // Private, hand-sent signup links (e.g. /signup/property-manager) pass this so
  // a brand-new account gets flipped straight to that role and into /partners,
  // instead of the normal room-seeker/investor onboarding wizard. Must work for
  // BOTH auth paths below — Google OAuth never runs onAuthenticated/routeAfterAuth
  // at all (it redirects through /auth/callback instead), so this also has to be
  // threaded through the callback URL for that path to end up in the same place.
  signupRole?: string;
  // Only meaningful alongside signupRole="provider" — private per-category
  // signup links (e.g. /signup/provider/insurance) pass this so the new
  // account also gets a pre-approved service_providers row in that category,
  // not just the role flip. { dbValue, label } matches lib/service-categories.ts.
  signupProviderCategory?: { dbValue: string; label: string };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const explicitDestination = redirectTo && redirectTo.startsWith("/") ? redirectTo : null;

  // Send the user to wherever they actually need to go next: resume onboarding if
  // it isn't finished yet, otherwise their real destination — an explicit one (e.g.
  // back to a listing) if we have it, else the right home for this account —
  // /dashboard for investors, /account for everyone else, kept deliberately separate.
  async function routeAfterAuth(userId: string) {
    if (onAuthenticated) {
      onAuthenticated(userId);
      return;
    }

    if (signupRole === "provider" && signupProviderCategory) {
      const { data: authUser } = await supabase.auth.getUser();
      await createProviderListing(
        supabase,
        userId,
        authUser.user?.email ?? "",
        signupProviderCategory.dbValue,
        signupProviderCategory.label
      );
      // Straight to filling in their business details rather than the portal
      // home, since a brand-new provider listing only has placeholder text.
      router.push("/partners/profile");
      router.refresh();
      return;
    }

    if (signupRole) {
      await supabase.from("users").update({ role: signupRole }).eq("id", userId);
      router.push("/partners");
      router.refresh();
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("onboarding_step, investor_access, role")
      .eq("id", userId)
      .maybeSingle();

    // Only carry an explicit redirect (e.g. back to a listing) into onboarding —
    // never a fabricated default, since investor vs tenant intent isn't decided
    // yet at this point and that default would wrongly stick through every step.
    const onboardingPath = getOnboardingPath(profile?.onboarding_step);
    if (onboardingPath) {
      router.push(appendRedirectTo(onboardingPath, explicitDestination));
    } else {
      router.push(
        explicitDestination ?? defaultDestination(profile?.investor_access, profile?.role)
      );
    }
    router.refresh();
  }

  async function handleGoogleAuth() {
    setError(null);
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (explicitDestination) {
      callbackUrl.searchParams.set("redirectTo", explicitDestination);
    }
    if (signupRole) {
      callbackUrl.searchParams.set("assignRole", signupRole);
    }
    if (signupProviderCategory) {
      callbackUrl.searchParams.set("providerCategoryValue", signupProviderCategory.dbValue);
      callbackUrl.searchParams.set("providerCategoryLabel", signupProviderCategory.label);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
    if (error) setError(error.message);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.session && data.user) {
        // Email confirmation disabled — user is already signed in.
        await routeAfterAuth(data.user.id);
      } else {
        setMessage("Check your email to confirm your account, then log in to continue.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        await routeAfterAuth(data.user.id);
      }
    }
    setLoading(false);
  }

  const signupHref = redirectTo ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}` : "/signup";
  const loginHref = redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login";

  return (
    <div className="w-full max-w-sm space-y-5">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleAuth}
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-wide text-muted">Or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-body">{message}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            {onSwitchMode ? (
              <button
                type="button"
                onClick={onSwitchMode}
                className="text-ink underline underline-offset-4"
              >
                Sign up
              </button>
            ) : (
              <Link href={signupHref} className="text-ink underline underline-offset-4">
                Sign up
              </Link>
            )}
          </>
        ) : (
          <>
            Already have an account?{" "}
            {onSwitchMode ? (
              <button
                type="button"
                onClick={onSwitchMode}
                className="text-ink underline underline-offset-4"
              >
                Log in
              </button>
            ) : (
              <Link href={loginHref} className="text-ink underline underline-offset-4">
                Log in
              </Link>
            )}
          </>
        )}
      </p>
      </form>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.89c2.28-2.1 3.56-5.2 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.89-3c-1.08.73-2.46 1.16-4.04 1.16-3.1 0-5.73-2.1-6.67-4.92H1.32v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.33 14.33A7.2 7.2 0 0 1 4.95 12c0-.81.14-1.6.38-2.33V6.58H1.32A12 12 0 0 0 0 12c0 1.94.46 3.77 1.32 5.42l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.32 6.58l4.01 3.09C6.27 6.85 8.9 4.75 12 4.75Z"
      />
    </svg>
  );
}
