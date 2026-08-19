"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddressAutocompleteInput } from "@/components/address-autocomplete-input";
import { StepHeader } from "@/components/onboarding/step-header";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EMPTY_INSURANCE_DETAILS,
  type InsuranceDetails,
  type YesNo,
} from "@/lib/insurance-quote";

const TOTAL_STEPS = 7;

function YesNoToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: YesNo;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "rounded-btn border border-line px-4 py-3 text-sm transition-colors",
            value === true ? "border-ink bg-ink text-white" : "text-ink hover:bg-linen"
          )}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "rounded-btn border border-line px-4 py-3 text-sm transition-colors",
            value === false ? "border-ink bg-ink text-white" : "text-ink hover:bg-linen"
          )}
        >
          No
        </button>
      </div>
    </div>
  );
}

function ToggleOption<T extends string>({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string;
  value: T;
  selected: boolean;
  onSelect: (v: T) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "rounded-btn border border-line px-4 py-3 text-left text-sm transition-colors",
        selected ? "border-ink bg-ink text-white" : "text-ink hover:bg-linen"
      )}
    >
      {label}
    </button>
  );
}

export function InsuranceQuoteRequestForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const lockRef = useRef(false);

  const [step, setStep] = useState(1);
  const [propertyAddress, setPropertyAddress] = useState("");
  const [addressFieldKey, setAddressFieldKey] = useState(0);
  const [notes, setNotes] = useState("");
  const [details, setDetails] = useState<InsuranceDetails>(EMPTY_INSURANCE_DETAILS);
  const [status, setStatus] = useState<"idle" | "checking" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  function set<K extends keyof InsuranceDetails>(key: K, value: InsuranceDetails[K]) {
    setDetails((d) => ({ ...d, [key]: value }));
  }

  async function fetchLockedUntil(): Promise<Date | null> {
    const { data } = await supabase
      .from("service_quote_requests")
      .select("created_at")
      .eq("user_id", userId)
      .eq("category", "insurance")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    const unlockAt = new Date(new Date(data.created_at).getTime() + 14 * 24 * 60 * 60 * 1000);
    return unlockAt > new Date() ? unlockAt : null;
  }

  useEffect(() => {
    fetchLockedUntil().then(setLockedUntil);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = propertyAddress.trim().length > 0 && details.numberOfBedrooms.trim().length > 0;

  async function handleSubmit() {
    if (lockRef.current || !canSubmit) return;
    lockRef.current = true;
    setError(null);
    setStatus("checking");

    const unlockAt = await fetchLockedUntil();
    if (unlockAt) {
      setLockedUntil(unlockAt);
      setStatus("idle");
      setError(
        `You can request another quote in this category from ${unlockAt.toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}.`
      );
      lockRef.current = false;
      return;
    }

    setStatus("submitting");

    const { error: insertError } = await supabase.from("service_quote_requests").insert({
      user_id: userId,
      category: "insurance",
      property_address: propertyAddress.trim(),
      number_of_rooms: Number(details.numberOfBedrooms),
      notes: notes.trim() || null,
      insurance_details: details,
    });

    if (insertError) {
      setStatus("idle");
      if (insertError.message.includes("request another quote")) {
        const raceUnlockAt = await fetchLockedUntil();
        setLockedUntil(raceUnlockAt);
        setError(insertError.message);
      } else {
        setError("Couldn't submit your request — please try again.");
      }
      lockRef.current = false;
      return;
    }

    setStatus("success");
    setLockedUntil(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
    await new Promise((resolve) => setTimeout(resolve, 1100));
    router.refresh();
    setPropertyAddress("");
    setAddressFieldKey((k) => k + 1);
    setNotes("");
    setDetails(EMPTY_INSURANCE_DETAILS);
    setStep(1);
    setStatus("idle");
    lockRef.current = false;
  }

  const busy = status !== "idle";

  if (lockedUntil && status === "idle" && step === 1) {
    return (
      <div className="rounded-card border border-line bg-white p-6 text-sm text-body">
        You already have an insurance quote request in — we&apos;ll be in touch soon. You can
        request another one from{" "}
        {lockedUntil.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
        .
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-white p-6">
      <StepHeader
        step={step}
        totalSteps={TOTAL_STEPS}
        title={STEP_TITLES[step - 1].title}
        subtitle={STEP_TITLES[step - 1].subtitle}
      />

      {step === 1 && (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="dateRequired">Date required</Label>
            <Input
              id="dateRequired"
              type="date"
              value={details.dateRequired}
              onChange={(e) => set("dateRequired", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insuredName">Insured name (individual or entity)</Label>
            <Input
              id="insuredName"
              value={details.insuredName}
              onChange={(e) => set("insuredName", e.target.value)}
              placeholder="e.g. Smith Family Trust"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insuredDob">Date of birth (if an individual)</Label>
            <Input
              id="insuredDob"
              type="date"
              value={details.insuredDob}
              onChange={(e) => set("insuredDob", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentInsurer">Current insurer (if any)</Label>
            <Input
              id="currentInsurer"
              value={details.currentInsurer}
              onChange={(e) => set("currentInsurer", e.target.value)}
              placeholder="N/A if none"
            />
          </div>
          <div className="space-y-2">
            <Label>Payment type</Label>
            <div className="grid grid-cols-2 gap-3">
              <ToggleOption
                label="Annual"
                value="annual"
                selected={details.paymentType === "annual"}
                onSelect={(v) => set("paymentType", v)}
              />
              <ToggleOption
                label="Monthly"
                value="monthly"
                selected={details.paymentType === "monthly"}
                onSelect={(v) => set("paymentType", v)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>What level of cover do you require?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => set("coverAccidentalDamage", !details.coverAccidentalDamage)}
                className={cn(
                  "rounded-btn border border-line px-4 py-3 text-sm transition-colors",
                  details.coverAccidentalDamage ? "border-ink bg-ink text-white" : "text-ink hover:bg-linen"
                )}
              >
                Accidental Damage
              </button>
              <button
                type="button"
                onClick={() => set("coverListedEvents", !details.coverListedEvents)}
                className={cn(
                  "rounded-btn border border-line px-4 py-3 text-sm transition-colors",
                  details.coverListedEvents ? "border-ink bg-ink text-white" : "text-ink hover:bg-linen"
                )}
              >
                Listed Events
              </button>
            </div>
          </div>
          <YesNoToggle
            label="Have you contacted another brokerage for quotes?"
            value={details.contactedOtherBrokerage}
            onChange={(v) => set("contactedOtherBrokerage", v)}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="propertyAddress">Property address</Label>
            <AddressAutocompleteInput
              key={addressFieldKey}
              id="propertyAddress"
              required
              value={propertyAddress}
              onChange={setPropertyAddress}
              placeholder="15 Grace Street, St Albans VIC 3021"
            />
          </div>
          <YesNoToggle
            label="Is there a mortgage on the property?"
            value={details.hasMortgage}
            onChange={(v) => set("hasMortgage", v)}
          />
          {details.hasMortgage && (
            <div className="space-y-2">
              <Label htmlFor="mortgageProvider">Mortgage provider name</Label>
              <Input
                id="mortgageProvider"
                value={details.mortgageProvider}
                onChange={(e) => set("mortgageProvider", e.target.value)}
              />
            </div>
          )}
          <YesNoToggle
            label="Is the property part of a strata?"
            value={details.isStrata}
            onChange={(v) => set("isStrata", v)}
          />
          <YesNoToggle
            label="Is the property managed by a licensed property manager?"
            value={details.hasPropertyManager}
            onChange={(v) => set("hasPropertyManager", v)}
          />
          {details.hasPropertyManager && (
            <div className="space-y-2">
              <Label htmlFor="propertyManagerName">Property manager name</Label>
              <Input
                id="propertyManagerName"
                value={details.propertyManagerName}
                onChange={(e) => set("propertyManagerName", e.target.value)}
              />
            </div>
          )}
          <YesNoToggle
            label="Is any business conducted from the property?"
            value={details.businessConducted}
            onChange={(v) => set("businessConducted", v)}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <YesNoToggle
            label="Is the property currently occupied?"
            value={details.currentlyOccupied}
            onChange={(v) => set("currentlyOccupied", v)}
          />
          <div className="space-y-2">
            <Label>Occupancy type</Label>
            <div className="grid grid-cols-2 gap-3">
              <ToggleOption
                label="Short-term"
                value="short_term"
                selected={details.occupancyType === "short_term"}
                onSelect={(v) => set("occupancyType", v)}
              />
              <ToggleOption
                label="Long-term"
                value="long_term"
                selected={details.occupancyType === "long_term"}
                onSelect={(v) => set("occupancyType", v)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="buildingSumInsured">Building sum insured ($)</Label>
              <Input
                id="buildingSumInsured"
                type="number"
                min={0}
                value={details.buildingSumInsured}
                onChange={(e) => set("buildingSumInsured", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contentsSumInsured">Contents sum insured ($)</Label>
              <Input
                id="contentsSumInsured"
                type="number"
                min={0}
                value={details.contentsSumInsured}
                onChange={(e) => set("contentsSumInsured", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avgWeeklyRental">Average weekly rental amount ($)</Label>
              <Input
                id="avgWeeklyRental"
                type="number"
                min={0}
                value={details.avgWeeklyRental}
                onChange={(e) => set("avgWeeklyRental", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excess">Excess ($)</Label>
              <Input
                id="excess"
                type="number"
                min={0}
                value={details.excess}
                onChange={(e) => set("excess", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <YesNoToggle
            label="Loss of Rent cover"
            value={details.coverLossOfRent}
            onChange={(v) => set("coverLossOfRent", v)}
          />
          <YesNoToggle
            label="Rent Default cover"
            value={details.coverRentDefault}
            onChange={(v) => set("coverRentDefault", v)}
          />
          <YesNoToggle
            label="Theft by Tenant cover"
            value={details.coverTheftByTenant}
            onChange={(v) => set("coverTheftByTenant", v)}
          />
        </div>
      )}

      {step === 5 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="numberOfLevels">Number of levels</Label>
              <Input
                id="numberOfLevels"
                type="number"
                min={1}
                value={details.numberOfLevels}
                onChange={(e) => set("numberOfLevels", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Period or year built</Label>
              <Input
                id="yearBuilt"
                type="number"
                min={1800}
                value={details.yearBuilt}
                onChange={(e) => set("yearBuilt", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallConstruction">Wall construction</Label>
              <Input
                id="wallConstruction"
                value={details.wallConstruction}
                onChange={(e) => set("wallConstruction", e.target.value)}
                placeholder="e.g. Brick, Hebel, Weatherboard"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roofConstruction">Roof construction</Label>
              <Input
                id="roofConstruction"
                value={details.roofConstruction}
                onChange={(e) => set("roofConstruction", e.target.value)}
                placeholder="e.g. Concrete tiles, Colorbond"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfBedrooms">Number of bedrooms</Label>
              <Input
                id="numberOfBedrooms"
                type="number"
                min={1}
                required
                value={details.numberOfBedrooms}
                onChange={(e) => set("numberOfBedrooms", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfBathrooms">Number of bathrooms</Label>
              <Input
                id="numberOfBathrooms"
                type="number"
                min={1}
                value={details.numberOfBathrooms}
                onChange={(e) => set("numberOfBathrooms", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Are solar panels fitted?</Label>
            <div className="grid grid-cols-3 gap-3">
              <ToggleOption label="No" value="none" selected={details.solarPanels === "none"} onSelect={(v) => set("solarPanels", v)} />
              <ToggleOption label="Standard" value="standard" selected={details.solarPanels === "standard"} onSelect={(v) => set("solarPanels", v)} />
              <ToggleOption label="Hail resistant" value="hail_resistant" selected={details.solarPanels === "hail_resistant"} onSelect={(v) => set("solarPanels", v)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Does the building have a swimming pool?</Label>
            <div className="grid grid-cols-3 gap-3">
              <ToggleOption label="No" value="none" selected={details.swimmingPool === "none"} onSelect={(v) => set("swimmingPool", v)} />
              <ToggleOption label="In-ground" value="in_ground" selected={details.swimmingPool === "in_ground"} onSelect={(v) => set("swimmingPool", v)} />
              <ToggleOption label="Above-ground" value="above_ground" selected={details.swimmingPool === "above_ground"} onSelect={(v) => set("swimmingPool", v)} />
            </div>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Doors</Label>
            <div className="grid grid-cols-2 gap-3">
              <ToggleOption label="None" value="none" selected={details.doorSecurity === "none"} onSelect={(v) => set("doorSecurity", v)} />
              <ToggleOption label="Deadlocks/bolts" value="deadlocks_bolts" selected={details.doorSecurity === "deadlocks_bolts"} onSelect={(v) => set("doorSecurity", v)} />
              <ToggleOption label="Key card access" value="key_card_access" selected={details.doorSecurity === "key_card_access"} onSelect={(v) => set("doorSecurity", v)} />
              <ToggleOption label="Key card & locks" value="key_card_and_locks" selected={details.doorSecurity === "key_card_and_locks"} onSelect={(v) => set("doorSecurity", v)} />
              <ToggleOption label="Other" value="other" selected={details.doorSecurity === "other"} onSelect={(v) => set("doorSecurity", v)} />
            </div>
            {details.doorSecurity === "other" && (
              <Input
                value={details.doorSecurityOther}
                onChange={(e) => set("doorSecurityOther", e.target.value)}
                placeholder="e.g. Digital pin code & fingerprint locks"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>Windows</Label>
            <div className="grid grid-cols-2 gap-3">
              <ToggleOption label="None" value="none" selected={details.windowSecurity === "none"} onSelect={(v) => set("windowSecurity", v)} />
              <ToggleOption label="Inaccessible" value="inaccessible" selected={details.windowSecurity === "inaccessible"} onSelect={(v) => set("windowSecurity", v)} />
              <ToggleOption label="Locks" value="locks" selected={details.windowSecurity === "locks"} onSelect={(v) => set("windowSecurity", v)} />
              <ToggleOption label="Bars" value="bars" selected={details.windowSecurity === "bars"} onSelect={(v) => set("windowSecurity", v)} />
              <ToggleOption label="Bars & locks" value="bars_and_locks" selected={details.windowSecurity === "bars_and_locks"} onSelect={(v) => set("windowSecurity", v)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>What type of burglar alarm is installed?</Label>
            <div className="grid grid-cols-3 gap-3">
              <ToggleOption label="None" value="none" selected={details.burglarAlarm === "none"} onSelect={(v) => set("burglarAlarm", v)} />
              <ToggleOption label="Unmonitored" value="unmonitored" selected={details.burglarAlarm === "unmonitored"} onSelect={(v) => set("burglarAlarm", v)} />
              <ToggleOption label="Monitored" value="monitored" selected={details.burglarAlarm === "monitored"} onSelect={(v) => set("burglarAlarm", v)} />
            </div>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-5">
          <YesNoToggle
            label="Is the property under construction, reconstruction, or renovation?"
            value={details.underConstruction}
            onChange={(v) => set("underConstruction", v)}
          />
          <YesNoToggle
            label="Is the property heritage listed?"
            value={details.heritageListed}
            onChange={(v) => set("heritageListed", v)}
          />
          <YesNoToggle
            label="Does the property have cyclone, flood or bushfire protections? (regional/northern AU only)"
            value={details.cycloneFloodBushfireProtection}
            onChange={(v) => set("cycloneFloodBushfireProtection", v)}
          />
          <YesNoToggle
            label="Any landlords-related claims in the last 5 years?"
            value={details.claimsLast5Years}
            onChange={(v) => set("claimsLast5Years", v)}
          />
          <YesNoToggle
            label="Any criminal convictions in the last 10 years?"
            value={details.criminalConvictionsLast10Years}
            onChange={(v) => set("criminalConvictionsLast10Years", v)}
          />
          <YesNoToggle
            label="Have you been declined insurance in the past 12 months?"
            value={details.declinedInsurancePast12Months}
            onChange={(v) => set("declinedInsurancePast12Months", v)}
          />
          <div className="space-y-2">
            <Label htmlFor="notes">Anything else we should know?</Label>
            <Textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-5 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || busy}
        >
          Back
        </Button>
        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
            disabled={step === 2 && !propertyAddress.trim()}
          >
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            className={cn(
              "transition-colors duration-300",
              status === "success" && "bg-green-600 hover:bg-green-600"
            )}
            disabled={busy || !canSubmit}
          >
            {status === "checking" && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…
              </>
            )}
            {status === "submitting" && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
              </>
            )}
            {status === "success" && (
              <>
                <Check className="mr-2 h-4 w-4" /> Request sent
              </>
            )}
            {status === "idle" && "Request quotes"}
          </Button>
        )}
      </div>
    </div>
  );
}

const STEP_TITLES: { title: string; subtitle: string }[] = [
  { title: "The basics", subtitle: "Cover type, payment, and general details." },
  { title: "Property details", subtitle: "Address, mortgage, and management." },
  { title: "Occupancy & sum insured", subtitle: "What the property's worth and how it's used." },
  { title: "Optional covers", subtitle: "Extra protection you may want included." },
  { title: "Building details", subtitle: "Construction, age, and size." },
  { title: "Security", subtitle: "Doors, windows, and alarms." },
  { title: "Additional info & claims history", subtitle: "Almost done." },
];
