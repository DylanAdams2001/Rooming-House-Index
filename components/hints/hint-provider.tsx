"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type HintContextValue = {
  hasSeen: (key: string) => boolean;
  markSeen: (key: string) => void;
};

const HintContext = createContext<HintContextValue | null>(null);

// One provider per portal layout (dashboard/account/partners), seeded with
// whatever the user has already dismissed (fetched server-side there) so
// there's no flash of a popup that should already be gone. Marking seen
// updates local state immediately (so the modal disappears right away) and
// persists to the database in the background — permanent per account, not
// per-browser, so it never reappears on another device either.
export function HintProvider({
  userId,
  initialSeenKeys,
  children,
}: {
  userId: string;
  initialSeenKeys: string[];
  children: React.ReactNode;
}) {
  const [seenKeys, setSeenKeys] = useState<Set<string>>(() => new Set(initialSeenKeys));
  const supabase = createClient();

  const hasSeen = useCallback((key: string) => seenKeys.has(key), [seenKeys]);

  const markSeen = useCallback(
    (key: string) => {
      setSeenKeys((prev) => {
        if (prev.has(key)) return prev;
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      supabase
        .from("user_seen_hints")
        .upsert({ user_id: userId, hint_key: key }, { onConflict: "user_id,hint_key" })
        .then(() => {});
    },
    [supabase, userId]
  );

  return <HintContext.Provider value={{ hasSeen, markSeen }}>{children}</HintContext.Provider>;
}

export function useHints() {
  const ctx = useContext(HintContext);
  if (!ctx) throw new Error("useHints must be used within a HintProvider");
  return ctx;
}
