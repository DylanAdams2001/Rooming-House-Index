"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "rounded-btn border border-line bg-white text-ink shadow-lg",
          title: "font-display text-sm",
          description: "text-body text-xs",
          actionButton: "bg-ink text-white",
          cancelButton: "bg-linen text-ink",
        },
      }}
    />
  );
}
