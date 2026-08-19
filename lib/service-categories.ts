// Single source of truth for the provider marketplace categories — used by the
// Services nav, the directory pages, and (eventually) the provider signup form.
// `dbCategory` must match the check constraint on public.service_providers.category
// in schema.sql. `slug` is the URL-friendly version used in /dashboard/services/[slug].

export type CredentialField = {
  key: string;
  label: string;
  placeholder: string;
};

export type ServiceCategory = {
  slug: string;
  dbCategory: string;
  label: string;
  comingSoon: boolean;
  description: string;
  credentialFields: CredentialField[];
  // Run in-house as a "submit once, we bring back multiple quotes" flow instead
  // of a self-serve provider directory — see app/dashboard/services/[category]/page.tsx.
  quoteBased?: boolean;
  // Building only, for now: real providers never see requests or reply
  // themselves — admin enters blind, anonymised price options by hand and
  // vets the investor before ever introducing the actual builder. New
  // request notifications go to admin instead of category providers.
  adminManagedQuotes?: boolean;
  // Insurance only, for now: no real broker has a provider account on the
  // platform yet, so admin is the one actually sourcing quotes (manually
  // filling out broker slips). Unlike adminManagedQuotes, this doesn't
  // replace the provider broadcast — admin gets notified in addition to
  // whatever category providers exist, so nothing needs to change again
  // once real brokers do join.
  alsoNotifyAdmin?: boolean;
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "insurance",
    dbCategory: "insurance",
    label: "Insurance",
    comingSoon: false,
    description: "Tell us about your rooming house and we'll bring back multiple insurance quotes.",
    quoteBased: true,
    alsoNotifyAdmin: true,
    credentialFields: [
      { key: "afslNumber", label: "AFSL Number", placeholder: "AFSL 123456" },
      {
        key: "insurersRepresented",
        label: "Insurers Represented (comma-separated)",
        placeholder: "QBE, Allianz, CGU",
      },
    ],
  },
  {
    slug: "conveyancing-legal",
    dbCategory: "conveyancing_legal",
    label: "Conveyancing / Legal",
    comingSoon: false,
    description: "Conveyancers and property lawyers for acquisitions and compliance.",
    credentialFields: [
      {
        key: "practisingCertificateNumber",
        label: "Practising Certificate Number",
        placeholder: "PC 123456",
      },
    ],
  },
  {
    slug: "inspectors",
    dbCategory: "inspectors",
    label: "Inspectors",
    comingSoon: false,
    description: "Building and rooming house standards inspectors.",
    credentialFields: [
      {
        key: "buildingPractitionerNumber",
        label: "Building Practitioner Number",
        placeholder: "BP-U 12345",
      },
    ],
  },
  {
    slug: "maintenance",
    dbCategory: "maintenance",
    label: "Maintenance",
    comingSoon: false,
    description: "Ongoing maintenance and trades for registered rooming houses.",
    credentialFields: [
      { key: "tradeLicenceNumber", label: "Trade Licence Number", placeholder: "REB 12345" },
    ],
  },
  {
    slug: "building",
    dbCategory: "building",
    label: "Accredited Builders",
    comingSoon: false,
    description: "Tell us about your build or renovation and we'll bring back multiple quotes direct from builders.",
    quoteBased: true,
    adminManagedQuotes: true,
    credentialFields: [
      { key: "buildingPractitionerNumber", label: "Building Practitioner Number", placeholder: "BP-U 12345" },
    ],
  },
  {
    slug: "finance",
    dbCategory: "finance",
    label: "Finance",
    comingSoon: false,
    description: "Accredited brokers experienced in rooming house finance.",
    credentialFields: [
      { key: "creditLicenceNumber", label: "Credit Licence Number", placeholder: "ACL 123456" },
    ],
  },
  {
    slug: "property-management",
    dbCategory: "property_management",
    label: "Property Management",
    comingSoon: false,
    description: "Tell us about your property and we'll bring back multiple quotes from managing agents.",
    quoteBased: true,
    credentialFields: [],
  },
  {
    slug: "furnishing",
    dbCategory: "furnishing",
    label: "Furnishing",
    comingSoon: false,
    description: "Room furnishing and fit-out suppliers for rooming houses.",
    credentialFields: [
      { key: "abn", label: "ABN", placeholder: "12 345 678 901" },
    ],
  },
];

export function getServiceCategory(slug: string) {
  return serviceCategories.find((c) => c.slug === slug);
}
