"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";

// Deliberately minimal — ad landing pages convert best with one path forward,
// not a full nav inviting people to click away. No SiteHeader here on purpose.
// Log in opens a modal rather than navigating to /login, so a click doesn't
// cost the visitor their place on the funnel page.
export function FunnelHeader() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <header className="border-b border-line/50 bg-ink">
      <div className="container-page flex h-16 items-center justify-between">
        <span className="font-display text-lg tracking-tight text-white">Rooming House Standard</span>
        <button
          type="button"
          onClick={() => setShowAuthModal(true)}
          className="text-sm text-white/60 hover:text-white"
        >
          Log in
        </button>
      </div>

      {showAuthModal && (
        <AuthModal
          initialMode="login"
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={() => {
            setShowAuthModal(false);
            router.refresh();
          }}
        />
      )}
    </header>
  );
}
