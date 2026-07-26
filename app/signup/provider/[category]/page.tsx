"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { getServiceCategory } from "@/lib/service-categories";

// Private signup link, not linked anywhere public — Dylan sends this directly
// to a hand-picked provider based on which category they are (e.g.
// /signup/provider/insurance). Flips the new account to role='provider' and
// creates a pre-approved service_providers row in that category (via
// AuthForm's signupProviderCategory prop, covering both the email/password
// and Google OAuth paths), skipping the old public self-serve join flow
// entirely — no business profile to fill in upfront, just an account plus a
// minimal listing they finish from /partners/profile afterward.
export default function ProviderSignupPage({ params }: { params: { category: string } }) {
  const category = getServiceCategory(params.category);
  const [mode, setMode] = useState<"signup" | "login">("signup");

  if (!category) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-offwhite px-6 text-center">
        <p className="text-body">Unknown provider category.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6">
      <Link href="/" className="mb-10 font-display text-2xl text-ink">
        Rooming House Index
      </Link>
      <div className="w-full max-w-sm rounded-card border border-line bg-white p-8">
        <h1 className="mb-1 text-center font-display text-2xl text-ink">
          {category.label} provider sign up
        </h1>
        <p className="mb-8 text-center text-sm text-muted">
          Set a password to create your partner account and start receiving quote requests.
        </p>
        <AuthForm
          mode={mode}
          signupRole="provider"
          signupProviderCategory={{ dbValue: category.dbCategory, label: category.label }}
          onSwitchMode={() => setMode(mode === "signup" ? "login" : "signup")}
        />
      </div>
    </div>
  );
}
