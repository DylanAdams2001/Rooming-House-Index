import { createClient } from "@/lib/supabase/server";
import { serviceCategories } from "@/lib/service-categories";
import { Card, CardContent } from "@/components/ui/card";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ShieldCheck, Building2 } from "lucide-react";

// Admin-only reference page: every private signup link in one place, so
// Dylan can grab the right one to send after vetting a partner — these are
// never linked anywhere public, this page is the only "directory" of them.
export default async function PartnerLinksPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  if (!isAdmin) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-12 text-center">
        <p className="text-body">This page is restricted to admin accounts.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-ink" />
        <h1 className="font-display text-3xl text-ink">Partner Sign-Up Links</h1>
      </div>
      <p className="mt-2 max-w-xl text-body">
        Vet a partner first, then send them the link matching what they are — each one drops
        them straight into the right side of the Partner Portal on signup, no public form.
      </p>

      <div className="mt-8 space-y-3">
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-ink" />
              <div>
                <p className="font-display text-base text-ink">Property Manager</p>
                <p className="text-xs text-muted">Lists and manages rooms</p>
              </div>
            </div>
            <CopyLinkButton path="/signup/property-manager" />
          </CardContent>
        </Card>

        {serviceCategories
          // property_management is handled exclusively by the Property Manager
          // link above — a single merged account, not a second provider-only
          // signup path for the same category (see lib/provider-signup.ts).
          .filter((c) => !c.comingSoon && c.dbCategory !== "property_management")
          .map((category) => (
            <Card key={category.slug}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-display text-base text-ink">{category.label}</p>
                  <p className="text-xs text-muted">
                    {category.quoteBased ? "Quote requests" : "Direct messaging"}
                  </p>
                </div>
                <CopyLinkButton path={`/signup/provider/${category.slug}`} />
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
