"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

// Private signup link, not linked anywhere public — Dylan sends this directly to
// a hand-picked property manager. One account handles both sides of their work:
// managing room listings/tenant enquiries (role='property_manager') AND
// replying to investor quote requests for property management services (a
// service_providers row, category='property_management') — deliberately not
// two separate accounts, since the same person handles both.
export default function PropertyManagerSignupPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6">
      <Link href="/" className="mb-10 font-display text-2xl text-ink">
        Rooming House Standard
      </Link>
      <div className="w-full max-w-sm rounded-card border border-line bg-white p-8">
        <h1 className="mb-1 text-center font-display text-2xl text-ink">
          Property manager sign up
        </h1>
        <p className="mb-8 text-center text-sm text-muted">
          Set a password to create your partner account.
        </p>
        <AuthForm
          mode={mode}
          signupRole="property_manager"
          signupProviderCategory={{ dbValue: "property_management", label: "Property Management" }}
          onSwitchMode={() => setMode(mode === "signup" ? "login" : "signup")}
        />
      </div>
    </div>
  );
}
