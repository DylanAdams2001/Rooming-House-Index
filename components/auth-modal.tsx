"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export function AuthModal({
  onClose,
  onAuthenticated,
  initialMode = "signup",
}: {
  onClose: () => void;
  onAuthenticated: (userId: string) => void;
  initialMode?: "login" | "signup";
}) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-card border border-line bg-white p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted transition-colors hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-center font-display text-2xl text-ink">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mb-6 text-center text-sm text-muted">
          {mode === "login" ? "Log in to continue" : "One profile for enquiring about rooms"}
        </p>

        <AuthForm
          mode={mode}
          onAuthenticated={onAuthenticated}
          onSwitchMode={() => setMode((m) => (m === "login" ? "signup" : "login"))}
        />
      </div>
    </div>
  );
}
