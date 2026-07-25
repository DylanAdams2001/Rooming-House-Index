export type OnboardingStep = "basics" | "photo" | "tenant_details" | "complete";

const STEP_PATH: Record<Exclude<OnboardingStep, "complete">, string> = {
  basics: "/onboarding/basics",
  photo: "/onboarding/photo",
  tenant_details: "/onboarding/tenant-details",
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
