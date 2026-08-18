// Real, address-level rent data for specific rooming houses — supplied directly
// (sale flyers, rent rolls), not estimated. Distinct from lib/mock-data.ts's
// suburb-wide averages: this is what a single property's rooms actually rent for.
export type PropertyRoomRental = {
  label: string;
  weeklyRate: number;
  status: "tenanted" | "vacant" | "under-application" | "unknown";
  note?: string;
};

export type PropertyRental = {
  id: string;
  address: string;
  suburbId: string;
  lat: number;
  lng: number;
  rooms: PropertyRoomRental[];
  // Omit when only some rooms have a known rate — showing a number labeled "average"
  // built from a partial rent roll would misrepresent the other rooms. The property
  // page falls back to averaging just the known rooms and labels it accordingly.
  avgWeeklyRate?: number;
  sourceNote: string;
  // ISO date this entry was added to the app (not when the underlying data was
  // published/sourced — that's whatever's in sourceNote).
  dateAdded: string;
};

export const propertyRentals: PropertyRental[] = [
  {
    id: "9-law-ct-wyndham-vale-3024",
    address: "9 Law Ct, Wyndham Vale VIC 3024",
    suburbId: "wyndham-vale-3024",
    lat: -37.8697418,
    lng: 144.6193665,
    rooms: [
      {
        label: "Studio 1",
        weeklyRate: 300,
        status: "tenanted",
        note: "Rent increasing to $330/wk on renewal",
      },
      {
        label: "Studio 2",
        weeklyRate: 360,
        status: "under-application",
        note: "Couple, application in progress",
      },
      {
        label: "Studio 3",
        weeklyRate: 310,
        status: "tenanted",
        note: "Rent increasing to $330/wk on renewal",
      },
      {
        label: "Studio 4",
        weeklyRate: 290,
        status: "tenanted",
        note: "Rent increasing to $330/wk on renewal",
      },
      {
        label: "Studio 5",
        weeklyRate: 0,
        status: "vacant",
        note: "Available now",
      },
    ],
    avgWeeklyRate: 315,
    sourceNote: "Real rent roll supplied directly, Aug 2026.",
    dateAdded: "2026-08-14",
  },
  {
    id: "2-nicholii-ct-manor-lakes-3024",
    address: "2 Nicholii Ct, Manor Lakes VIC 3024",
    suburbId: "wyndham-vale-3024",
    lat: -37.8686285,
    lng: 144.5950127,
    rooms: [
      {
        label: "Room 1",
        weeklyRate: 350,
        status: "vacant",
        note: "Own private ensuite · advertised, not yet tenanted",
      },
      { label: "Room 2", weeklyRate: 290, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 3", weeklyRate: 290, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 4", weeklyRate: 290, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 5", weeklyRate: 290, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 6", weeklyRate: 340, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 7", weeklyRate: 300, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 8", weeklyRate: 290, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 305,
    sourceNote:
      "Advertised asking rates, listing dated 11 Aug 2026 (bills & internet included) — this is a new listing, not a rent roll, so none of these rooms are confirmed tenanted yet. Map pin is the Manor Lakes area centroid, not the exact street — Nicholii Ct isn't in the CAV register or mapping services yet (likely a very recently built street).",
    dateAdded: "2026-08-14",
  },
  {
    id: "1-jolly-st-frankston-3199",
    address: "1 Jolly St, Frankston VIC 3199",
    suburbId: "frankston-3199",
    lat: -38.1431475,
    lng: 145.135403,
    rooms: [
      { label: "Studio 1", weeklyRate: 400, status: "tenanted" },
      { label: "Room 2", weeklyRate: 0, status: "unknown" },
      { label: "Room 3", weeklyRate: 0, status: "unknown" },
      { label: "Room 4", weeklyRate: 0, status: "unknown" },
      { label: "Room 5", weeklyRate: 0, status: "unknown" },
      { label: "Room 6", weeklyRate: 0, status: "unknown" },
      { label: "Room 7", weeklyRate: 0, status: "unknown" },
      { label: "Room 8", weeklyRate: 0, status: "unknown" },
      { label: "Room 9", weeklyRate: 0, status: "unknown" },
    ],
    sourceNote:
      "9-bedroom property — only Studio 1's rate ($400/wk) has been supplied directly. Rates for the other 8 rooms aren't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "13-austin-st-werribee-3030",
    address: "13 Austin St, Werribee VIC 3030",
    suburbId: "werribee-3030",
    lat: -37.8956508,
    lng: 144.6623189,
    rooms: [{ label: "Room 1", weeklyRate: 380, status: "tenanted" }],
    avgWeeklyRate: 380,
    sourceNote: "Rented rate supplied directly. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "7-market-rd-werribee-3030",
    address: "7 Market Rd, Werribee VIC 3030",
    suburbId: "werribee-3030",
    lat: -37.897818,
    lng: 144.6625041,
    rooms: [
      { label: "Room 1", weeklyRate: 0, status: "unknown" },
      { label: "Room 2", weeklyRate: 0, status: "unknown" },
      { label: "Room 3", weeklyRate: 0, status: "unknown" },
      { label: "Room 4", weeklyRate: 0, status: "unknown" },
      { label: "Room 5", weeklyRate: 0, status: "unknown" },
      { label: "Room 6", weeklyRate: 0, status: "unknown" },
      { label: "Room 7", weeklyRate: 0, status: "unknown" },
      { label: "Room 8", weeklyRate: 0, status: "unknown" },
      {
        label: "Room 9",
        weeklyRate: 360,
        status: "vacant",
        note: "Unfurnished · available now",
      },
    ],
    sourceNote:
      "Only Room 9's rate ($360/wk, available now, unfurnished) has been supplied directly. Rates for the other 8 rooms aren't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "12-gwenda-st-dandenong-3175",
    address: "12 Gwenda St, Dandenong VIC 3175",
    suburbId: "dandenong-3175",
    lat: -37.9768622,
    lng: 145.2079933,
    rooms: [{ label: "Room 1", weeklyRate: 380, status: "tenanted" }],
    avgWeeklyRate: 380,
    sourceNote: "Rented rate supplied directly. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "9-centre-ave-werribee-3030",
    address: "9 Centre Ave, Werribee VIC 3030",
    suburbId: "werribee-3030",
    lat: -37.8937764,
    lng: 144.6554676,
    rooms: [{ label: "Room 1", weeklyRate: 380, status: "tenanted" }],
    avgWeeklyRate: 380,
    sourceNote: "Rented rate supplied directly. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "4-wyndham-st-werribee-3030",
    address: "4 Wyndham St, Werribee VIC 3030",
    suburbId: "werribee-3030",
    lat: -37.8951012,
    lng: 144.6623482,
    rooms: [
      { label: "Room 1", weeklyRate: 380, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 380,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "1-kingsford-st-laverton-3028",
    address: "1 Kingsford St, Laverton VIC 3028",
    suburbId: "laverton-3028",
    lat: -37.8593513,
    lng: 144.7694472,
    rooms: [
      { label: "Room 1", weeklyRate: 359, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 2", weeklyRate: 369, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 3", weeklyRate: 369, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 4", weeklyRate: 369, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 5", weeklyRate: 369, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 6", weeklyRate: 349, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 7", weeklyRate: 349, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 8", weeklyRate: 349, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 9", weeklyRate: 349, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 359,
    sourceNote:
      "Advertised asking rates supplied directly — currently looking for tenants, not yet rented.",
    dateAdded: "2026-08-14",
  },
  {
    id: "15-powell-dr-hoppers-crossing-3029",
    address: "15 Powell Dr, Hoppers Crossing VIC 3029",
    suburbId: "hoppers-crossing-3029",
    lat: -37.8812304,
    lng: 144.6999904,
    rooms: [
      {
        label: "Room 2",
        weeklyRate: 380,
        status: "vacant",
        note: "Unfurnished · advertised, not yet tenanted",
      },
    ],
    avgWeeklyRate: 380,
    sourceNote:
      "Only Room 2's rate has been supplied directly. Total room count for this property and rates for any other rooms aren't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "1b-mcnamara-rd-laverton-3028",
    address: "1B McNamara Rd, Laverton VIC 3028",
    suburbId: "laverton-3028",
    lat: -37.854237,
    lng: 144.7721886,
    rooms: [
      { label: "Room 1", weeklyRate: 350, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 350,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "160-bladin-st-laverton-3028",
    address: "160 Bladin St, Laverton VIC 3028",
    suburbId: "laverton-3028",
    lat: -37.8609895,
    lng: 144.7698201,
    rooms: [
      { label: "Room 1", weeklyRate: 0, status: "unknown" },
      { label: "Room 2", weeklyRate: 0, status: "unknown" },
      { label: "Room 3", weeklyRate: 0, status: "unknown" },
      {
        label: "Room 4",
        weeklyRate: 370,
        status: "vacant",
        note: "Bills included · advertised, not yet tenanted",
      },
      { label: "Room 5", weeklyRate: 0, status: "unknown" },
      {
        label: "Room 6",
        weeklyRate: 370,
        status: "vacant",
        note: "Bills included · advertised, not yet tenanted",
      },
    ],
    sourceNote:
      "Only Rooms 4 and 6 have known rates ($370/wk each, bills included, advertised). Rates for the other rooms aren't known yet — total room count may be higher than 6.",
    dateAdded: "2026-08-14",
  },
  {
    id: "4-scotsburn-grove-werribee-3030",
    address: "4 Scotsburn Grove, Werribee VIC 3030",
    suburbId: "werribee-3030",
    lat: -37.8956587,
    lng: 144.6636053,
    rooms: [
      { label: "Room 1", weeklyRate: 350, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 350,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "6-richmond-cres-werribee-3030",
    address: "6 Richmond Cres, Werribee VIC 3030 (Units 1–9)",
    suburbId: "werribee-3030",
    lat: -37.8949109,
    lng: 144.657182,
    rooms: [
      {
        label: "Advertised rate (unit TBC)",
        weeklyRate: 380,
        status: "vacant",
        note: "Not tied to a specific unit number yet · advertised, not yet tenanted",
      },
    ],
    sourceNote:
      "This address covers 9 units (1–9/6 Richmond Cres). Only one advertised rate ($380/wk) has been supplied so far, not linked to a specific unit — per-unit rates for the complex aren't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "37-margaret-st-werribee-3030",
    address: "37 Margaret St, Werribee VIC 3030",
    suburbId: "werribee-3030",
    lat: -37.8936953,
    lng: 144.6585069,
    rooms: [
      {
        label: "Room 1",
        weeklyRate: 360,
        status: "vacant",
        note: "Unfurnished · advertised, not yet tenanted",
      },
    ],
    avgWeeklyRate: 360,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "25-pettitt-cres-norlane-3214",
    address: "25 Pettitt Cres, Norlane VIC 3214",
    suburbId: "norlane-3214",
    lat: -38.0972926,
    lng: 144.3596245,
    rooms: [
      {
        label: "Room 1",
        weeklyRate: 285,
        status: "vacant",
        note: "Unfurnished, bills included · advertised, not yet tenanted",
      },
    ],
    avgWeeklyRate: 285,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "82-rose-ave-norlane-3214",
    address: "82 Rose Ave, Norlane VIC 3214",
    suburbId: "norlane-3214",
    lat: -38.0884526,
    lng: 144.3652362,
    rooms: [
      {
        label: "Room 1",
        weeklyRate: 300,
        status: "vacant",
        note: "Bills and furniture included · advertised, not yet tenanted",
      },
    ],
    avgWeeklyRate: 300,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "6-kalver-st-corio-3214",
    address: "6 Kalver St, Corio VIC 3214",
    suburbId: "norlane-3214",
    lat: -38.0701575,
    lng: 144.3626149,
    rooms: [
      {
        label: "Room 1",
        weeklyRate: 280,
        status: "vacant",
        note: "Bills and furniture included · advertised, not yet tenanted",
      },
    ],
    avgWeeklyRate: 280,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-14",
  },
  {
    id: "17-woodland-dr-albanvale-3021",
    address: "17 Woodland Dr, Albanvale VIC 3021",
    suburbId: "st-albans-3021",
    lat: -37.7457286,
    lng: 144.7657578,
    rooms: [
      { label: "Room 1", weeklyRate: 320, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 320,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-14",
  },
];

export function getPropertyRentalsForSuburb(suburbId: string) {
  return propertyRentals.filter((p) => p.suburbId === suburbId);
}

export function getPropertyRentalById(id: string) {
  return propertyRentals.find((p) => p.id === id);
}

// Short "avg $X/wk" style summary, honest about partial rent rolls — e.g. "$400/wk
// (1 of 9 rooms)" rather than presenting a single known room's rate as an average.
export function getPropertyRateSummary(property: PropertyRental): string {
  if (property.avgWeeklyRate !== undefined) {
    return `avg $${property.avgWeeklyRate}/wk`;
  }
  const knownRooms = property.rooms.filter((r) => r.status !== "unknown" && r.weeklyRate > 0);
  if (knownRooms.length === 0) return "no rate data yet";
  const avg = Math.round(
    knownRooms.reduce((sum, r) => sum + r.weeklyRate, 0) / knownRooms.length
  );
  return `$${avg}/wk (${knownRooms.length} of ${property.rooms.length} rooms)`;
}
