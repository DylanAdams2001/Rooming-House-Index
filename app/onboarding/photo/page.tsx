"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { defaultDestination } from "@/lib/onboarding";
import { StepHeader } from "@/components/onboarding/step-header";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

function PhotoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirectTo = searchParams.get("redirectTo");
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("users")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.avatar_url) setPreview(profile.avatar_url);
      setLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function nextStepPath() {
    const redirectTo = explicitRedirectTo ?? defaultDestination();
    return `/onboarding/tenant-details?redirectTo=${encodeURIComponent(redirectTo)}`;
  }

  async function advance() {
    if (!userId) return;
    await supabase.from("users").update({ onboarding_step: "tenant_details" }).eq("id", userId);
    router.push(nextStepPath());
    router.refresh();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleUpload() {
    if (!userId || !file) return;
    setLoading(true);
    setError(null);

    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setLoading(false);
      setError("Couldn't upload — this needs a live Supabase project connected.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(path);

    await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", userId);

    setLoading(false);
    await advance();
  }

  return (
    <>
      <StepHeader
        step={2}
        totalSteps={3}
        title="Add a profile photo"
        subtitle="Helps landlords and providers recognise who they're talking to."
      />

      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-line bg-offwhite">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <User className="h-10 w-10 text-muted" />
          )}
        </div>

        <label className="cursor-pointer text-sm text-ink underline underline-offset-4">
          Choose a photo
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex w-full flex-col gap-3">
          <Button onClick={handleUpload} disabled={!file || loading || !loaded} className="w-full">
            {loading ? "Uploading…" : "Save and continue"}
          </Button>
          <Button variant="outline" className="w-full" disabled={!loaded} onClick={() => advance()}>
            {loaded ? "Skip for now" : "Loading…"}
          </Button>
        </div>
      </div>
    </>
  );
}

export default function OnboardingPhotoPage() {
  return (
    <Suspense fallback={null}>
      <PhotoForm />
    </Suspense>
  );
}
