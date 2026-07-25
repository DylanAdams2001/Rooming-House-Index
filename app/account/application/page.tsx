"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApplicationForm } from "@/components/account/application-form";

function ApplicationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Present when someone arrived here via Enquire on a listing but hadn't filled in
  // an application yet — EnquireButton redirects here, then this sends them back to
  // the listing (redirectTo) once it's saved so they can actually compose their message.
  const pendingListingTitle = searchParams.get("listingTitle");
  const redirectTo = searchParams.get("redirectTo");

  function handleSaved() {
    if (redirectTo) {
      router.push(redirectTo);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-ink">My Application</h1>
      <p className="mt-2 text-body">
        The details a landlord sees when you enquire about a room. Update this any time.
      </p>

      {redirectTo && pendingListingTitle && (
        <div className="mt-6 rounded-card border border-ink bg-linen p-5">
          <p className="text-sm text-ink">
            Complete your application below, then you&apos;ll be sent back to message the
            property team about <span className="font-medium">{pendingListingTitle}</span>.
          </p>
        </div>
      )}

      <div className="mt-8">
        <ApplicationForm onSaved={handleSaved} />
      </div>
    </div>
  );
}

export default function ApplicationPage() {
  return (
    <Suspense fallback={null}>
      <ApplicationContent />
    </Suspense>
  );
}
