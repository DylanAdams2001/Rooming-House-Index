"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Some "mark as read/viewed" writes happen inside a Server Component with no
// chat thread on the page at all (e.g. opening a quote request for the first
// time). Same problem as ChatThread's mount effect: the parent layout's
// unread badge won't refetch on a plain client-side navigation, so without
// this the dot stays lit until a manual reload.
export function MarkReadRefresher({ watch }: { watch: string }) {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return null;
}
