"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Shared by /account/settings and /dashboard/settings — the same account fields
// (photo, name, email, phone) apply regardless of whether someone signed up to
// browse listings or unlocked investor access; nothing here is role-specific.
export function ProfilePage() {
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("users")
        .select("full_name, phone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      setFullName(profile?.full_name ?? "");
      setPhone(profile?.phone ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);
      setLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    setEmailMessage(null);

    let nextAvatarUrl = avatarUrl;

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setSaving(false);
        setError("Couldn't upload your photo — this needs a live Supabase project connected.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(path);
      nextAvatarUrl = publicUrl;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ full_name: fullName, phone, avatar_url: nextAvatarUrl })
      .eq("id", userId);

    if (updateError) {
      setSaving(false);
      setError("Couldn't save your details — this needs a live Supabase project connected.");
      return;
    }

    // Email changes go through Supabase auth separately from the rest of the profile —
    // depending on the project's email settings this may require confirming via a link
    // sent to the new address before it actually takes effect.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (email && email !== user?.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) {
        setEmailMessage(`Couldn't update email: ${emailError.message}`);
      } else {
        setEmailMessage("Check your new email address to confirm the change.");
      }
    }

    setAvatarUrl(nextAvatarUrl);
    setFile(null);
    setSaving(false);
    setSaved(true);
  }

  if (!loaded) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Profile</h1>
      <p className="mt-2 text-body">Update your photo and contact details.</p>

      <Card className="mt-8 max-w-lg">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar
                seed={userId ?? "profile"}
                name={fullName || email}
                photoUrl={preview ?? avatarUrl}
                className="h-16 w-16 shrink-0 text-xl"
              />
              <label className="cursor-pointer text-sm text-ink underline underline-offset-4">
                Change photo
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {emailMessage && <p className="text-sm text-body">{emailMessage}</p>}
            {saved && !error && <p className="text-sm text-body">Saved.</p>}

            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
