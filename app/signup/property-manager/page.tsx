"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

// Private signup link, not linked anywhere public — Dylan sends this directly to
// a hand-picked property manager. Unlike the normal /signup flow, it flips the
// new account straight to role='property_manager' (via AuthForm's signupRole
// prop, which handles both the email/password and Google OAuth paths) and sends
// them into /partners, skipping the investor/tenant onboarding wizard entirely —
// no business profile to collect, per the "keep it minimal" call on this feature.
export default function PropertyManagerSignupPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6">
      <Link href="/" className="mb-10 font-display text-2xl text-ink">
        Rooming House Index
      </Link>
      <div className="w-full max-w-sm rounded-card border border-line bg-white p-8">
        <h1 className="mb-1 text-center font-display text-2xl text-ink">
          Property manager sign up
        </h1>
        <p className="mb-8 text-center text-sm text-muted">
          Set a password to create your partner account and start listing rooms.
        </p>
        <AuthForm
          mode={mode}
          signupRole="property_manager"
          onSwitchMode={() => setMode(mode === "signup" ? "login" : "signup")}
        />
      </div>
    </div>
  );
}
