export type OnboardingStep = "basics" | "intent" | "investor_details" | "photo" | "complete";

const STEP_PATH: Record<Exclude<OnboardingStep, "complete">, string> = {
  basics: "/onboarding/basics",
  intent: "/onboarding/intent",
  investor_details: "/onboarding/investor-details",
  photo: "/onboarding/photo",
};

// Where to send a user based on how far they've gotten through onboarding.
// Returns null once onboarding is complete (caller should use their real destination).
export function getOnboardingPath(step: string | null | undefined): string | null {
  if (!step || step === "complete") return null;
  if (step in STEP_PATH) return STEP_PATH[step as Exclude<OnboardingStep, "complete">];
  return null;
}

export function buildOnboardingUrl(step: string | null | undefined, redirectTo: string): string | null {
  const path = getOnboardingPath(step);
  if (!path) return null;
  return `${path}?redirectTo=${encodeURIComponent(redirectTo)}`;
}

// Appends redirectTo only when it's a real, explicit destination (e.g. back to a
// listing after an enquiry). Onboarding steps must NOT fabricate a fallback like
// "/account" this early — investor vs tenant intent isn't known yet at this point
// in the flow, so a fabricated default here would wrongly override the investor
// destination computed once intent actually gets chosen.
export function appendRedirectTo(path: string, redirectTo?: string | null): string {
  return redirectTo ? `${path}?redirectTo=${encodeURIComponent(redirectTo)}` : path;
}

// Investors land in /dashboard, partners (service providers / property managers)
// land in /partners, everyone else in /account — deliberately kept as separate
// experiences (different nav, different content) even though it's one login.
// Partner role wins over investor_access if both apply, since it's the account's
// primary identity. Keyed on the same fields middleware uses to gate each area,
// so this always agrees with what a user is actually allowed to see. Admin's
// home base is the Business Partners directory, not any one investor/tenant/
// partner experience — those are all still reachable from there.
export function defaultDestination(investorAccess?: string | null, role?: string | null): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "provider" || role === "property_manager") return "/partners";
  return investorAccess === "active" ? "/dashboard" : "/account";
}
