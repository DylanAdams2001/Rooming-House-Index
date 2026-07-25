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

// Investors land in /dashboard, everyone else in /account — deliberately kept as
// separate experiences (different nav, different content) even though it's one
// login. Keyed on investor_access, the same flag middleware uses to gate /dashboard,
// so this always agrees with what a user is actually allowed to see.
export function defaultDestination(investorAccess?: string | null): string {
  return investorAccess === "active" ? "/dashboard" : "/account";
}
