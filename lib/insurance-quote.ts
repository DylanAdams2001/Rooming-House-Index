// Shape of service_quote_requests.insurance_details (jsonb), captured by the
// insurance-only quote form and rendered back out on the admin/provider side —
// see components/insurance-quote-request-form.tsx and
// components/partners/quote-request-summary.tsx.
export type YesNo = boolean | null;

export type InsuranceDetails = {
  dateRequired: string;
  insuredName: string;
  insuredDob: string;
  currentInsurer: string;
  paymentType: "annual" | "monthly" | null;
  coverAccidentalDamage: boolean;
  coverListedEvents: boolean;
  contactedOtherBrokerage: YesNo;

  hasMortgage: YesNo;
  mortgageProvider: string;
  isStrata: YesNo;
  hasPropertyManager: YesNo;
  propertyManagerName: string;
  businessConducted: YesNo;

  currentlyOccupied: YesNo;
  occupancyType: "short_term" | "long_term" | null;

  buildingSumInsured: string;
  contentsSumInsured: string;
  avgWeeklyRental: string;
  excess: string;

  coverLossOfRent: YesNo;
  coverRentDefault: YesNo;
  coverTheftByTenant: YesNo;

  numberOfLevels: string;
  wallConstruction: string;
  roofConstruction: string;
  yearBuilt: string;
  numberOfBedrooms: string;
  numberOfBathrooms: string;
  solarPanels: "none" | "standard" | "hail_resistant" | null;
  swimmingPool: "none" | "in_ground" | "above_ground" | null;

  doorSecurity: "none" | "deadlocks_bolts" | "key_card_access" | "key_card_and_locks" | "other" | null;
  doorSecurityOther: string;
  windowSecurity: "none" | "inaccessible" | "locks" | "bars" | "bars_and_locks" | null;
  burglarAlarm: "none" | "unmonitored" | "monitored" | null;

  underConstruction: YesNo;
  heritageListed: YesNo;
  cycloneFloodBushfireProtection: YesNo;

  claimsLast5Years: YesNo;
  criminalConvictionsLast10Years: YesNo;
  declinedInsurancePast12Months: YesNo;
};

export const EMPTY_INSURANCE_DETAILS: InsuranceDetails = {
  dateRequired: "",
  insuredName: "",
  insuredDob: "",
  currentInsurer: "",
  paymentType: null,
  coverAccidentalDamage: false,
  coverListedEvents: false,
  contactedOtherBrokerage: null,
  hasMortgage: null,
  mortgageProvider: "",
  isStrata: null,
  hasPropertyManager: null,
  propertyManagerName: "",
  businessConducted: null,
  currentlyOccupied: null,
  occupancyType: null,
  buildingSumInsured: "",
  contentsSumInsured: "",
  avgWeeklyRental: "",
  excess: "",
  coverLossOfRent: null,
  coverRentDefault: null,
  coverTheftByTenant: null,
  numberOfLevels: "",
  wallConstruction: "",
  roofConstruction: "",
  yearBuilt: "",
  numberOfBedrooms: "",
  numberOfBathrooms: "",
  solarPanels: null,
  swimmingPool: null,
  doorSecurity: null,
  doorSecurityOther: "",
  windowSecurity: null,
  burglarAlarm: null,
  underConstruction: null,
  heritageListed: null,
  cycloneFloodBushfireProtection: null,
  claimsLast5Years: null,
  criminalConvictionsLast10Years: null,
  declinedInsurancePast12Months: null,
};

function yesNo(v: YesNo): string | null {
  return v === null ? null : v ? "Yes" : "No";
}

const SOLAR_LABEL: Record<string, string> = {
  none: "No",
  standard: "Yes — standard",
  hail_resistant: "Yes — hail resistant",
};
const POOL_LABEL: Record<string, string> = {
  none: "No",
  in_ground: "Yes — in-ground",
  above_ground: "Yes — above-ground",
};
const DOOR_LABEL: Record<string, string> = {
  none: "None",
  deadlocks_bolts: "Deadlocks/bolts",
  key_card_access: "Key card access",
  key_card_and_locks: "Key card & locks",
  other: "Other",
};
const WINDOW_LABEL: Record<string, string> = {
  none: "None",
  inaccessible: "Inaccessible",
  locks: "Locks",
  bars: "Bars",
  bars_and_locks: "Bars & locks",
};
const ALARM_LABEL: Record<string, string> = {
  none: "None",
  unmonitored: "Unmonitored",
  monitored: "Monitored",
};

export type InsuranceDetailField = { section: string; label: string; value: string };

// Flattens the stored details into label/value rows grouped by section, for a
// human to read — skips anything left unanswered rather than showing blanks.
export function formatInsuranceDetails(details: InsuranceDetails): InsuranceDetailField[] {
  const rows: InsuranceDetailField[] = [];
  const add = (section: string, label: string, value: string | null | undefined) => {
    if (value !== null && value !== undefined && value !== "") rows.push({ section, label, value });
  };

  add("Basics", "Date required", details.dateRequired);
  add("Basics", "Insured name", details.insuredName);
  add("Basics", "Insured date of birth", details.insuredDob);
  add("Basics", "Current insurer", details.currentInsurer);
  add(
    "Basics",
    "Payment type",
    details.paymentType === "annual" ? "Annual" : details.paymentType === "monthly" ? "Monthly" : null
  );
  const covers = [
    details.coverAccidentalDamage ? "Accidental Damage" : null,
    details.coverListedEvents ? "Listed Events" : null,
  ].filter(Boolean);
  add("Basics", "Level of cover", covers.length ? covers.join(", ") : null);
  add("Basics", "Contacted another brokerage?", yesNo(details.contactedOtherBrokerage));

  add("Property", "Mortgage?", yesNo(details.hasMortgage));
  add("Property", "Mortgage provider", details.mortgageProvider);
  add("Property", "Part of a strata?", yesNo(details.isStrata));
  add("Property", "Managed by a licensed property manager?", yesNo(details.hasPropertyManager));
  add("Property", "Property manager name", details.propertyManagerName);
  add("Property", "Business conducted from property?", yesNo(details.businessConducted));

  add("Occupancy & sum insured", "Currently occupied?", yesNo(details.currentlyOccupied));
  add(
    "Occupancy & sum insured",
    "Occupancy type",
    details.occupancyType === "short_term" ? "Short-term" : details.occupancyType === "long_term" ? "Long-term" : null
  );
  add("Occupancy & sum insured", "Building sum insured", details.buildingSumInsured && `$${details.buildingSumInsured}`);
  add("Occupancy & sum insured", "Contents sum insured", details.contentsSumInsured && `$${details.contentsSumInsured}`);
  add("Occupancy & sum insured", "Average weekly rental", details.avgWeeklyRental && `$${details.avgWeeklyRental}`);
  add("Occupancy & sum insured", "Excess", details.excess && `$${details.excess}`);

  add("Optional covers", "Loss of Rent", yesNo(details.coverLossOfRent));
  add("Optional covers", "Rent Default", yesNo(details.coverRentDefault));
  add("Optional covers", "Theft by Tenant", yesNo(details.coverTheftByTenant));

  add("Building details", "Number of levels", details.numberOfLevels);
  add("Building details", "Wall construction", details.wallConstruction);
  add("Building details", "Roof construction", details.roofConstruction);
  add("Building details", "Period/year built", details.yearBuilt);
  add("Building details", "Number of bedrooms", details.numberOfBedrooms);
  add("Building details", "Number of bathrooms", details.numberOfBathrooms);
  add("Building details", "Solar panels", details.solarPanels ? SOLAR_LABEL[details.solarPanels] : null);
  add("Building details", "Swimming pool", details.swimmingPool ? POOL_LABEL[details.swimmingPool] : null);

  add(
    "Security",
    "Doors",
    details.doorSecurity
      ? details.doorSecurity === "other" && details.doorSecurityOther
        ? details.doorSecurityOther
        : DOOR_LABEL[details.doorSecurity]
      : null
  );
  add("Security", "Windows", details.windowSecurity ? WINDOW_LABEL[details.windowSecurity] : null);
  add("Security", "Burglar alarm", details.burglarAlarm ? ALARM_LABEL[details.burglarAlarm] : null);

  add("Additional info & claims", "Under construction/renovation?", yesNo(details.underConstruction));
  add("Additional info & claims", "Heritage listed?", yesNo(details.heritageListed));
  add(
    "Additional info & claims",
    "Cyclone/flood/bushfire protections?",
    yesNo(details.cycloneFloodBushfireProtection)
  );
  add("Additional info & claims", "Landlords claims (last 5 years)?", yesNo(details.claimsLast5Years));
  add(
    "Additional info & claims",
    "Criminal convictions (last 10 years)?",
    yesNo(details.criminalConvictionsLast10Years)
  );
  add(
    "Additional info & claims",
    "Declined insurance (past 12 months)?",
    yesNo(details.declinedInsurancePast12Months)
  );

  return rows;
}
