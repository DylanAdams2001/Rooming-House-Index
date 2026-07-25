// Mock service-provider directory data. Once real providers sign up (see
// schema.sql's service_providers table), this file gets replaced by a
// Supabase query filtered to status = 'approved'. Shape mirrors the DB
// table closely so swapping the data source later is mechanical.

export type FurniturePackageItem = {
  name: string;
  dimensions?: string;
  unitPrice: number;
  assemblyFee?: number;
  quantity: number;
  amount: number;
};

export type FurniturePackage = {
  title: string;
  items: FurniturePackageItem[];
  subtotal: number;
  gst: number;
  total: number;
  // Where the real pricing came from — kept visible rather than presented as if
  // the (illustrative) provider itself quoted it.
  sourceNote: string;
};

export type ServiceProvider = {
  id: string;
  category: string; // matches service-categories.ts dbCategory
  businessName: string;
  description: string;
  contactEmail: string;
  contactPhone?: string;
  coverageAreas: string[];
  licenseNumber?: string;
  credentials: Record<string, string | string[]>;
  furniturePackage?: FurniturePackage;
};

export const mockProviders: ServiceProvider[] = [
  {
    id: "provider-landlord-shield",
    category: "insurance",
    businessName: "Landlord Shield Insurance",
    description:
      "Specialist landlord and rooming house insurance broker covering building, contents, and public liability for registered rooming houses across Victoria.",
    contactEmail: "hello@landlordshield.example",
    contactPhone: "1300 555 010",
    coverageAreas: ["VIC"],
    licenseNumber: "AFSL 234567",
    credentials: {
      afslNumber: "AFSL 234567",
      insurersRepresented: ["QBE", "Allianz", "CGU"],
    },
  },
  {
    id: "provider-tenancy-cover",
    category: "insurance",
    businessName: "Tenancy Cover Group",
    description:
      "Public liability and loss-of-rent insurance tailored to multi-occupancy rooming houses, with fast claims turnaround for high-turnover properties.",
    contactEmail: "team@tenancycover.example",
    contactPhone: "1300 555 021",
    coverageAreas: ["VIC", "NSW"],
    licenseNumber: "AFSL 245678",
    credentials: {
      afslNumber: "AFSL 245678",
      insurersRepresented: ["Suncorp", "Allianz"],
    },
  },
  {
    id: "provider-westside-conveyancing",
    category: "conveyancing_legal",
    businessName: "Westside Conveyancing & Property Law",
    description:
      "Conveyancing and property law firm experienced in rooming house acquisitions, title searches, and registration compliance with local councils.",
    contactEmail: "info@westsideconveyancing.example",
    contactPhone: "03 5555 0132",
    coverageAreas: ["VIC"],
    licenseNumber: "PC 445566",
    credentials: {
      practisingCertificateNumber: "PC 445566",
    },
  },
  {
    id: "provider-dandenong-legal",
    category: "conveyancing_legal",
    businessName: "Dandenong Property Legal",
    description:
      "Boutique property law practice focused on investment purchases, lease agreements, and rooming house registration disputes.",
    contactEmail: "contact@dandenonglegal.example",
    contactPhone: "03 5555 0187",
    coverageAreas: ["VIC"],
    licenseNumber: "PC 778899",
    credentials: {
      practisingCertificateNumber: "PC 778899",
    },
  },
  {
    id: "provider-standards-check",
    category: "inspectors",
    businessName: "Standards Check Building Inspections",
    description:
      "Independent building and rooming house standards inspections — pre-purchase reports and ongoing minimum-standards compliance checks.",
    contactEmail: "bookings@standardscheck.example",
    contactPhone: "1300 555 044",
    coverageAreas: ["VIC"],
    licenseNumber: "BP-U 55234",
    credentials: {
      buildingPractitionerNumber: "BP-U 55234",
    },
  },
  {
    id: "provider-clearview-inspections",
    category: "inspectors",
    businessName: "Clearview Property Inspections",
    description:
      "Detailed condition reports and fire/safety compliance inspections for registered rooming houses, with same-week turnaround.",
    contactEmail: "office@clearviewinspections.example",
    contactPhone: "1300 555 055",
    coverageAreas: ["VIC"],
    licenseNumber: "BP-U 55891",
    credentials: {
      buildingPractitionerNumber: "BP-U 55891",
    },
  },
  {
    id: "provider-allsuburbs-maintenance",
    category: "maintenance",
    businessName: "All Suburbs Maintenance Co.",
    description:
      "General maintenance and repairs for rooming houses — plumbing, electrical call-outs, and room turnover make-ready services.",
    contactEmail: "jobs@allsuburbsmaintenance.example",
    contactPhone: "1300 555 066",
    coverageAreas: ["VIC"],
    licenseNumber: "REB 33221",
    credentials: {
      tradeLicenceNumber: "REB 33221",
    },
  },
  {
    id: "provider-rapid-fix",
    category: "maintenance",
    businessName: "Rapid Fix Property Services",
    description:
      "24-hour emergency maintenance line for rooming house operators, plus scheduled preventative maintenance plans.",
    contactEmail: "support@rapidfix.example",
    contactPhone: "1300 555 077",
    coverageAreas: ["VIC"],
    licenseNumber: "REB 44112",
    credentials: {
      tradeLicenceNumber: "REB 44112",
    },
  },
  {
    id: "provider-roomready-furnishing",
    category: "furnishing",
    businessName: "RoomReady Furnishing Co.",
    description:
      "Full room fit-out packages for rooming houses — bed, storage, and kitchenette furnishing supplied and installed in bulk at investor pricing.",
    contactEmail: "orders@roomready.example",
    contactPhone: "1300 555 088",
    coverageAreas: ["VIC"],
    licenseNumber: "ABN 55 123 456 789",
    credentials: {
      abn: "55 123 456 789",
    },
    furniturePackage: {
      title: "9 Bedroom Accommodation — Sample Package",
      items: [
        { name: "Ensemble Base — Queen (Australian Made)", dimensions: "2030 x 1520 x 350 mm", unitPrice: 303, assemblyFee: 5, quantity: 9, amount: 2772 },
        { name: "Bedhead — Queen (matched to base)", unitPrice: 395, quantity: 9, amount: 3555 },
        { name: "Fire Retardant Mattress — Queen", dimensions: "2030 x 1530 x 210 mm", unitPrice: 194, quantity: 9, amount: 1746 },
        { name: "Bedside Table — Natural Oak", dimensions: "420 x 390 x 500 mm", unitPrice: 110, assemblyFee: 20, quantity: 18, amount: 2340 },
        { name: '40" Android TV', dimensions: "900 x 230 x 570 mm (with stand)", unitPrice: 250, quantity: 9, amount: 2250 },
        { name: "TV bracket (excl. wall assembly)", unitPrice: 35, quantity: 9, amount: 315 },
        { name: "Round Dining Table — 80cm", dimensions: "800 x 800 x 760 mm", unitPrice: 96, assemblyFee: 10, quantity: 9, amount: 954 },
        { name: "Padded Replica Dining Chair", dimensions: "440 x 540 x 860 mm", unitPrice: 60, assemblyFee: 10, quantity: 18, amount: 1260 },
        { name: "End/Coffee Table with Glass Top", dimensions: "500 x 300 x 600 mm", unitPrice: 66, assemblyFee: 15, quantity: 9, amount: 729 },
        { name: "197L Fridge — White", dimensions: "60 x 55 x 142 cm", unitPrice: 380, assemblyFee: 15, quantity: 9, amount: 3555 },
        { name: "2 Seater PU Leather Sofa (Fire Retardant)", dimensions: "870 x 1320 x 740 mm", unitPrice: 427, assemblyFee: 15, quantity: 9, amount: 3978 },
        { name: "1800 Dining Table", dimensions: "1800 x 900 x 760 mm", unitPrice: 331, assemblyFee: 40, quantity: 1, amount: 371 },
        { name: "Padded Replica Dining Chair — Grey (Set of 4)", dimensions: "480 x 550 x 800 mm", unitPrice: 60, assemblyFee: 5, quantity: 6, amount: 390 },
        { name: "34L Microwave", unitPrice: 130, quantity: 10, amount: 1300 },
        { name: "Kettle", unitPrice: 10, quantity: 10, amount: 100 },
        { name: "2-Slice Toaster", unitPrice: 14, quantity: 10, amount: 140 },
        { name: "334L Top Mount Fridge — White", dimensions: "60.5 x 67 x 170.5 cm", unitPrice: 580, assemblyFee: 15, quantity: 1, amount: 595 },
        { name: "Delivery, move-in, unpack & rubbish collection", unitPrice: 700, quantity: 1, amount: 700 },
      ],
      subtotal: 27050,
      gst: 2705,
      total: 29755,
      sourceNote: "Sample pricing from a real HEQS furniture package quote for 9-room accommodation, supplied ex GST. Quotes are typically valid 30 days — treat as indicative, not a live price.",
    },
  },
  {
    id: "provider-bulk-interiors",
    category: "furnishing",
    businessName: "Bulk Interiors",
    description:
      "Wholesale furniture supplier with rooming-house-specific bundles — durable, easy-clean finishes designed for high-turnover rooms.",
    contactEmail: "sales@bulkinteriors.example",
    contactPhone: "1300 555 099",
    coverageAreas: ["VIC", "NSW"],
    licenseNumber: "ABN 66 234 567 890",
    credentials: {
      abn: "66 234 567 890",
    },
  },
  {
    id: "provider-civic-homes",
    category: "building",
    businessName: "Civic Homes",
    description:
      "Builder specialising in purpose-built rooming house construction and conversions, from concept through to registration-ready handover.",
    contactEmail: "hello@civichomes.example",
    contactPhone: "1300 555 110",
    coverageAreas: ["VIC"],
    licenseNumber: "BP-U 66123",
    credentials: {
      buildingPractitionerNumber: "BP-U 66123",
    },
  },
  {
    id: "provider-dixon-builds",
    category: "building",
    businessName: "Dixon Builds",
    description:
      "Residential builder with experience converting existing homes into compliant multi-room rooming houses.",
    contactEmail: "info@dixonbuilds.example",
    contactPhone: "1300 555 121",
    coverageAreas: ["VIC"],
    licenseNumber: "BP-U 66234",
    credentials: {
      buildingPractitionerNumber: "BP-U 66234",
    },
  },
  {
    id: "provider-todd-finance",
    category: "finance",
    businessName: "Todd",
    description: "Accredited rooming house finance broker — purchase, refinance, and SMSF lending.",
    contactEmail: "todd@rhifinance.example",
    contactPhone: "1300 555 131",
    coverageAreas: ["VIC"],
    licenseNumber: "ACL 771001",
    credentials: {
      creditLicenceNumber: "ACL 771001",
    },
  },
  {
    id: "provider-joe-finance",
    category: "finance",
    businessName: "Joe",
    description: "Accredited rooming house finance broker — purchase, refinance, and SMSF lending.",
    contactEmail: "joe@rhifinance.example",
    contactPhone: "1300 555 132",
    coverageAreas: ["VIC"],
    licenseNumber: "ACL 771002",
    credentials: {
      creditLicenceNumber: "ACL 771002",
    },
  },
  {
    id: "provider-rob-finance",
    category: "finance",
    businessName: "Rob",
    description: "Accredited rooming house finance broker — purchase, refinance, and SMSF lending.",
    contactEmail: "rob@rhifinance.example",
    contactPhone: "1300 555 133",
    coverageAreas: ["VIC"],
    licenseNumber: "ACL 771003",
    credentials: {
      creditLicenceNumber: "ACL 771003",
    },
  },
];

export function getProvidersByCategory(category: string) {
  return mockProviders.filter((p) => p.category === category);
}

export function getProviderById(id: string) {
  return mockProviders.find((p) => p.id === id);
}
