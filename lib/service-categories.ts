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
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "insurance",
    dbCategory: "insurance",
    label: "Insurance",
    comingSoon: false,
    description: "Landlord and rooming house insurance providers.",
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
    label: "Building",
    comingSoon: true,
    description: "Builders and renovators for rooming house conversions.",
    credentialFields: [],
  },
  {
    slug: "property-management",
    dbCategory: "property_management",
    label: "Property Management",
    comingSoon: true,
    description: "Managing agents specialising in rooming houses.",
    credentialFields: [],
  },
  {
    slug: "furnishing",
    dbCategory: "furnishing",
    label: "Furnishing",
    comingSoon: true,
    description: "Room furnishing and fit-out suppliers.",
    credentialFields: [],
  },
];

export function getServiceCategory(slug: string) {
  return serviceCategories.find((c) => c.slug === slug);
}
