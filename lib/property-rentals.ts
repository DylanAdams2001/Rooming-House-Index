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
      { label: "Room 1", weeklyRate: 380, status: "tenanted", note: "Leased Jun 2026 (confirmed via Domain.com.au)" },
    ],
    avgWeeklyRate: 380,
    sourceNote: "Advertised rate supplied directly, since leased and confirmed via Domain.com.au property history.",
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
      { label: "Room 6", weeklyRate: 349, status: "tenanted", note: "Leased Aug 2026 (confirmed via Domain.com.au)" },
      { label: "Room 7", weeklyRate: 349, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 8", weeklyRate: 349, status: "vacant", note: "Advertised, not yet tenanted" },
      { label: "Room 9", weeklyRate: 349, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 359,
    sourceNote:
      "Advertised asking rates supplied directly. Room 6 confirmed leased via Domain.com.au property history (matches the $349/wk asking rate); the other 8 rooms' status isn't confirmed.",
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
        status: "tenanted",
        note: "Unfurnished · leased Aug 2026 (confirmed via Domain.com.au)",
      },
    ],
    avgWeeklyRate: 380,
    sourceNote:
      "Only Room 2's rate has been supplied directly, since leased and confirmed via Domain.com.au property history. Total room count for this property and rates for any other rooms aren't known yet.",
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
        status: "tenanted",
        note: "Bills included · leased Aug 2026 (confirmed via Domain.com.au)",
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
      "Only Rooms 4 and 6 have known rates ($370/wk each, bills included). Room 4 is confirmed leased via Domain.com.au property history; Room 6's status isn't confirmed. Rates for the other rooms aren't known yet — total room count may be higher than 6.",
    dateAdded: "2026-08-14",
  },
  {
    id: "4-scotsburn-grove-werribee-3030",
    address: "4 Scotsburn Grove, Werribee VIC 3030",
    suburbId: "werribee-3030",
    lat: -37.8956587,
    lng: 144.6636053,
    rooms: [
      { label: "Room 1", weeklyRate: 350, status: "tenanted", note: "Leased Aug 2026 (confirmed via Domain.com.au)" },
    ],
    avgWeeklyRate: 350,
    sourceNote: "Advertised rate supplied directly, since leased and confirmed via Domain.com.au property history.",
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
        label: "Confirmed rate (unit TBC)",
        weeklyRate: 360,
        status: "tenanted",
        note: "Not tied to a specific unit number yet · one unit confirmed leased Aug 2026 at $360/wk via Domain.com.au",
      },
    ],
    sourceNote:
      "This address covers 9 units (1–9/6 Richmond Cres). Originally advertised at $380/wk (unit unspecified); Domain.com.au property history now confirms at least one unit leased at $360/wk. Status of the other 8 units isn't known yet.",
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
        status: "tenanted",
        note: "Unfurnished · leased Jul 2026 (confirmed via Domain.com.au)",
      },
    ],
    avgWeeklyRate: 360,
    sourceNote: "Advertised rate supplied directly, since leased and confirmed via Domain.com.au property history.",
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
        status: "tenanted",
        note: "Unfurnished, bills included · leased Aug 2026 (confirmed via Domain.com.au)",
      },
    ],
    avgWeeklyRate: 285,
    sourceNote: "Advertised rate supplied directly, since leased and confirmed via Domain.com.au property history.",
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
        status: "tenanted",
        note: "Bills and furniture included · leased Aug 2026 (confirmed via Domain.com.au)",
      },
    ],
    avgWeeklyRate: 300,
    sourceNote: "Advertised rate supplied directly, since leased and confirmed via Domain.com.au property history.",
    dateAdded: "2026-08-14",
  },
  {
    id: "6-kalver-st-corio-3214",
    address: "6 Kalver St, Corio VIC 3214",
    suburbId: "corio-3214",
    lat: -38.0701575,
    lng: 144.3626149,
    rooms: [
      {
        label: "Room 1",
        weeklyRate: 280,
        status: "tenanted",
        note: "Bills and furniture included · leased Aug 2026 (confirmed via Domain.com.au)",
      },
    ],
    avgWeeklyRate: 280,
    sourceNote: "Advertised rate supplied directly, since leased and confirmed via Domain.com.au property history.",
    dateAdded: "2026-08-14",
  },
  {
    id: "17-woodland-dr-albanvale-3021",
    address: "17 Woodland Dr, Albanvale VIC 3021",
    suburbId: "albanvale-3021",
    lat: -37.7457286,
    lng: 144.7657578,
    rooms: [
      { label: "Room 1", weeklyRate: 300, status: "tenanted", note: "Leased Aug 2026 at $300/wk (confirmed via Domain.com.au) — below the original $320/wk asking price" },
    ],
    avgWeeklyRate: 300,
    sourceNote: "Originally advertised at $320/wk; confirmed leased at $300/wk via Domain.com.au property history.",
    dateAdded: "2026-08-14",
  },
  {
    id: "6-panabeh-pl-grovedale-3216",
    address: "6 Panabeh Pl, Grovedale VIC 3216",
    suburbId: "highton-3216",
    lat: -38.2127574,
    lng: 144.3116288,
    rooms: [
      { label: "Room 1", weeklyRate: 240, status: "tenanted", note: "Leased Aug 2026 (confirmed via Domain.com.au)" },
    ],
    avgWeeklyRate: 240,
    sourceNote: "Advertised rate supplied directly, since leased and confirmed via Domain.com.au property history.",
    dateAdded: "2026-08-19",
  },
  {
    id: "51-braund-ave-bell-post-hill-3215",
    address: "51 Braund Ave, Bell Post Hill VIC 3215",
    suburbId: "hamlyn-heights-3215",
    lat: -38.098092,
    lng: 144.3285853,
    rooms: [
      { label: "Room 1", weeklyRate: 370, status: "tenanted", note: "Leased Aug 2026 (confirmed via Domain.com.au)" },
    ],
    avgWeeklyRate: 370,
    sourceNote: "Advertised rate supplied directly, since leased and confirmed via Domain.com.au property history.",
    dateAdded: "2026-08-19",
  },
  {
    id: "1-catania-cl-waurn-ponds-3216",
    address: "1 Catania Cl, Waurn Ponds VIC 3216",
    suburbId: "highton-3216",
    lat: -38.2154361,
    lng: 144.2991566,
    rooms: [
      { label: "Room 1", weeklyRate: 300, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 300,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-19",
  },
  {
    id: "34-primrose-dr-waurn-ponds-3216",
    address: "34 Primrose Dr, Waurn Ponds VIC 3216",
    suburbId: "highton-3216",
    lat: -38.2151228,
    lng: 144.2962771,
    rooms: [
      { label: "Room 1", weeklyRate: 270, status: "tenanted", note: "Leased Aug 2026 (confirmed via Domain.com.au) — exact final rate not publicly disclosed, showing original advertised rate" },
    ],
    avgWeeklyRate: 270,
    sourceNote:
      "Advertised asking rate supplied directly, since leased and confirmed via Domain.com.au — the site did not disclose the exact final rate, so the original advertised rate is shown.",
    dateAdded: "2026-08-19",
  },
  {
    id: "1-halesworth-st-st-albans-3021",
    address: "1 Halesworth St, St Albans VIC 3021",
    suburbId: "st-albans-3021",
    lat: -37.7477158,
    lng: 144.81476,
    rooms: [{ label: "Room 1", weeklyRate: 376, status: "tenanted" }],
    avgWeeklyRate: 376,
    sourceNote: "Real rent income supplied directly.",
    dateAdded: "2026-08-19",
  },
  {
    id: "12-cox-st-st-albans-3021",
    address: "12 Cox St, St Albans VIC 3021",
    suburbId: "st-albans-3021",
    lat: -37.7573071,
    lng: 144.8058981,
    rooms: [
      { label: "Room 1", weeklyRate: 310, status: "tenanted", note: "Leased Aug 2026 at $310/wk (confirmed via Domain.com.au) — below the original $340/wk asking price" },
    ],
    avgWeeklyRate: 310,
    sourceNote: "Originally advertised at $340/wk; confirmed leased at $310/wk via Domain.com.au property history.",
    dateAdded: "2026-08-19",
  },
  {
    id: "4-17-rhodes-st-st-albans-3021",
    address: "4/17 Rhodes St, St Albans VIC 3021",
    suburbId: "st-albans-3021",
    lat: -37.7568455,
    lng: 144.8062742,
    rooms: [
      { label: "Unit 4", weeklyRate: 375, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 375,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-19",
  },
  {
    id: "38-george-st-st-albans-3021",
    address: "38 George St, St Albans VIC 3021",
    suburbId: "st-albans-3021",
    lat: -37.7313505,
    lng: 144.8047968,
    rooms: [
      { label: "Room 1", weeklyRate: 280, status: "tenanted", note: "Leased from 16 Feb 2026" },
    ],
    avgWeeklyRate: 280,
    sourceNote: "Real rent income supplied directly.",
    dateAdded: "2026-08-19",
  },
  {
    id: "74-oberon-ave-st-albans-3021",
    address: "74 Oberon Ave, St Albans VIC 3021",
    suburbId: "st-albans-3021",
    lat: -37.7387666,
    lng: 144.8088051,
    rooms: [
      { label: "Room 1", weeklyRate: 325, status: "tenanted", note: "Leased from 12 May 2026" },
      { label: "Room 2", weeklyRate: 345, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 335,
    sourceNote: "Real rent income supplied directly.",
    dateAdded: "2026-08-19",
  },
  {
    id: "19-annetta-ct-albanvale-3021",
    address: "19 Annetta Court, Albanvale VIC 3021",
    suburbId: "albanvale-3021",
    lat: -37.7436625,
    lng: 144.7717198,
    rooms: [
      { label: "Room 1", weeklyRate: 310, status: "tenanted", note: "Leased Aug 2026 (confirmed via Domain.com.au)" },
    ],
    avgWeeklyRate: 310,
    sourceNote: "Advertised rate supplied directly, since leased and confirmed via Domain.com.au property history.",
    dateAdded: "2026-08-19",
  },
  {
    id: "6-9-stenson-rd-kealba-3021",
    address: "6/9 Stenson Rd, Kealba VIC 3021",
    suburbId: "kealba-3021",
    lat: -37.7390988,
    lng: 144.8245652,
    rooms: [{ label: "Unit 6", weeklyRate: 375, status: "tenanted" }],
    avgWeeklyRate: 375,
    sourceNote: "Real rent income supplied directly.",
    dateAdded: "2026-08-19",
  },
  {
    id: "15-grace-st-st-albans-3021",
    address: "15 Grace St, St Albans VIC 3021",
    suburbId: "st-albans-3021",
    lat: -37.7332955,
    lng: 144.8123566,
    rooms: [
      { label: "Unit 9", weeklyRate: 350, status: "tenanted", note: "Leased from 13 Aug 2026" },
    ],
    avgWeeklyRate: 350,
    sourceNote: "Real rent income and lease history supplied directly (property manager's leased-properties report).",
    dateAdded: "2026-08-19",
  },
  {
    id: "46-beaver-st-st-albans-3021",
    address: "46 Beaver St, St Albans VIC 3021",
    suburbId: "st-albans-3021",
    lat: -37.7469512,
    lng: 144.8061788,
    rooms: [
      { label: "Room 1", weeklyRate: 350, status: "tenanted", note: "Leased Aug 2026 as Unit 2/46 (confirmed via Domain.com.au)" },
    ],
    avgWeeklyRate: 350,
    sourceNote: "Advertised rate supplied directly, since leased and confirmed via Domain.com.au property history.",
    dateAdded: "2026-08-19",
  },
  {
    id: "48-quail-cres-melton-3337",
    address: "48 Quail Cres, Melton VIC 3337",
    suburbId: "melton-3337",
    lat: -37.6779604,
    lng: 144.5711647,
    rooms: [{ label: "Room 1", weeklyRate: 340, status: "tenanted" }],
    avgWeeklyRate: 340,
    sourceNote: "Real rent income supplied directly.",
    dateAdded: "2026-08-19",
  },
  {
    id: "188-station-rd-melton-3337",
    address: "188 Station Rd, Melton VIC 3337",
    suburbId: "melton-3337",
    lat: -37.6865827,
    lng: 144.5784012,
    rooms: [{ label: "Room 1", weeklyRate: 350, status: "tenanted" }],
    avgWeeklyRate: 350,
    sourceNote: "Real rent income supplied directly.",
    dateAdded: "2026-08-19",
  },
  {
    id: "11-raymond-st-melton-south-3338",
    address: "11 Raymond St, Melton South VIC 3338 (Units 2, 4, 8, 9)",
    suburbId: "melton-south-3338",
    lat: -37.6951794,
    lng: 144.5812414,
    rooms: [
      { label: "Unit 2", weeklyRate: 350, status: "tenanted", note: "Leased from 10 Oct 2025" },
      {
        label: "Unit 4",
        weeklyRate: 310,
        status: "vacant",
        note: "Previously leased at $310/wk from 28 May 2026; that tenancy has ended and it's advertised again at the same rate",
      },
      { label: "Unit 8", weeklyRate: 320, status: "tenanted", note: "Leased from 13 May 2026" },
      { label: "Unit 9", weeklyRate: 315, status: "tenanted", note: "Leased from 27 Feb 2026" },
    ],
    avgWeeklyRate: 324,
    sourceNote:
      "Real rent income and lease history supplied directly (property manager's leased-properties report), plus a separately confirmed current advertised rate for Unit 4.",
    dateAdded: "2026-08-19",
  },
  {
    id: "3-raymond-st-melton-south-3338",
    address: "3 Raymond St, Melton South VIC 3338",
    suburbId: "melton-south-3338",
    lat: -37.6947807,
    lng: 144.5801746,
    rooms: [
      { label: "Room 1", weeklyRate: 330, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 330,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-19",
  },
  {
    id: "15-burnewang-st-albion-3020",
    address: "15 Burnewang St, Albion VIC 3020 (Units 1, 2, 3, 5)",
    suburbId: "albion-3020",
    lat: -37.7837299,
    lng: 144.8199048,
    rooms: [
      { label: "Unit 1", weeklyRate: 370, status: "tenanted", note: "Leased from 27 Nov 2025" },
      { label: "Unit 2", weeklyRate: 360, status: "tenanted", note: "Leased from 7 May 2026" },
      { label: "Unit 3", weeklyRate: 340, status: "tenanted", note: "Leased from 24 Mar 2026" },
      { label: "Unit 5", weeklyRate: 360, status: "tenanted", note: "Leased from 30 Mar 2026" },
    ],
    avgWeeklyRate: 358,
    sourceNote: "Real rent income and lease history supplied directly (property manager's leased-properties report).",
    dateAdded: "2026-08-19",
  },
  {
    id: "329-camp-rd-broadmeadows-3047",
    address: "329 Camp Rd, Broadmeadows VIC 3047 (Units 1, 2, 3, 4, 6)",
    suburbId: "broadmeadows-3047",
    lat: -37.6865983,
    lng: 144.92943,
    rooms: [
      { label: "Unit 1", weeklyRate: 400, status: "tenanted", note: "Leased from 5 Feb 2026" },
      { label: "Unit 2", weeklyRate: 360, status: "tenanted", note: "Leased from 17 Nov 2025" },
      { label: "Unit 3", weeklyRate: 360, status: "tenanted", note: "Leased from 29 Nov 2025" },
      { label: "Unit 4", weeklyRate: 375, status: "tenanted", note: "Leased from 17 Jun 2026" },
      { label: "Unit 6", weeklyRate: 385, status: "tenanted", note: "Leased from 29 Jul 2026" },
    ],
    avgWeeklyRate: 376,
    sourceNote: "Real rent income and lease history supplied directly (property manager's leased-properties report).",
    dateAdded: "2026-08-19",
  },
  {
    id: "13-raymond-st-melton-south-3338",
    address: "13 Raymond St, Melton South VIC 3338 (Units 2, 3, 4, 7, 9 + 1 unspecified)",
    suburbId: "melton-south-3338",
    lat: -37.6951717,
    lng: 144.5813929,
    rooms: [
      { label: "Room (unit TBC)", weeklyRate: 350, status: "tenanted", note: "Leased from 13 May 2026 — specific unit number not supplied" },
      { label: "Unit 2", weeklyRate: 350, status: "tenanted", note: "Leased from 6 Oct 2025" },
      { label: "Unit 3", weeklyRate: 350, status: "tenanted", note: "Leased from 4 Sep 2025" },
      { label: "Unit 4", weeklyRate: 350, status: "tenanted", note: "Leased from 29 Jul 2026" },
      { label: "Unit 7", weeklyRate: 350, status: "tenanted", note: "Leased from 18 Nov 2025" },
      { label: "Unit 9", weeklyRate: 350, status: "tenanted", note: "Leased from 4 Dec 2025" },
    ],
    avgWeeklyRate: 350,
    sourceNote: "Real rent income and lease history supplied directly (property manager's leased-properties report).",
    dateAdded: "2026-08-19",
  },
  {
    id: "484-thompson-rd-norlane-3214",
    address: "484 Thompson Rd, Norlane VIC 3214 (Units 2, 3, 4, 7, 9)",
    suburbId: "norlane-3214",
    lat: -38.0954892,
    lng: 144.3466216,
    rooms: [
      { label: "Unit 2", weeklyRate: 350, status: "tenanted", note: "Leased from 10 Apr 2026" },
      { label: "Unit 3", weeklyRate: 350, status: "tenanted", note: "Leased from 16 Dec 2025" },
      { label: "Unit 4", weeklyRate: 340, status: "tenanted", note: "Leased from 29 May 2026" },
      { label: "Unit 7", weeklyRate: 325, status: "tenanted", note: "Leased from 16 Sep 2025" },
      { label: "Unit 9", weeklyRate: 325, status: "tenanted", note: "Leased from 8 Jul 2026" },
    ],
    avgWeeklyRate: 338,
    sourceNote: "Real rent income and lease history supplied directly (property manager's leased-properties report).",
    dateAdded: "2026-08-19",
  },
  {
    id: "28-cawood-dr-sunshine-west-3020",
    address: "28 Cawood Dr, Sunshine West VIC 3020 (Units 2, 5, 6, 8, 9)",
    suburbId: "sunshine-west-3020",
    lat: -37.8025199,
    lng: 144.8102848,
    rooms: [
      { label: "Unit 2", weeklyRate: 375, status: "tenanted", note: "Leased from 29 Jan 2026" },
      { label: "Unit 5", weeklyRate: 365, status: "tenanted", note: "Leased from 20 Nov 2025" },
      { label: "Unit 6", weeklyRate: 375, status: "tenanted", note: "Leased from 2 Feb 2026" },
      { label: "Unit 8", weeklyRate: 375, status: "tenanted", note: "Leased from 2 Dec 2025" },
      { label: "Unit 9", weeklyRate: 375, status: "tenanted", note: "Leased from 10 Jul 2026" },
    ],
    avgWeeklyRate: 373,
    sourceNote: "Real rent income and lease history supplied directly (property manager's leased-properties report).",
    dateAdded: "2026-08-19",
  },
  {
    id: "16-anderson-st-werribee-3030",
    address: "16 Anderson St, Werribee VIC 3030 (Units 1, 2)",
    suburbId: "werribee-3030",
    lat: -37.9039873,
    lng: 144.6619053,
    rooms: [
      { label: "Unit 1", weeklyRate: 350, status: "tenanted", note: "Leased from 15 Jun 2026" },
      { label: "Unit 2", weeklyRate: 350, status: "tenanted", note: "Leased from 4 Feb 2026" },
    ],
    avgWeeklyRate: 350,
    sourceNote: "Real rent income and lease history supplied directly (property manager's leased-properties report).",
    dateAdded: "2026-08-19",
  },
  {
    id: "19b-thompson-ct-werribee-3030",
    address: "19B Thompson Ct, Werribee VIC 3030 (Units 4, 5, 7)",
    suburbId: "werribee-3030",
    lat: -37.8921484,
    lng: 144.6819438,
    rooms: [
      { label: "Unit 4", weeklyRate: 340, status: "tenanted", note: "Leased from 11 Jun 2026" },
      { label: "Unit 5", weeklyRate: 340, status: "tenanted", note: "Leased from 6 Feb 2026" },
      { label: "Unit 7", weeklyRate: 340, status: "tenanted", note: "Leased from 18 Jun 2026" },
    ],
    avgWeeklyRate: 340,
    sourceNote: "Real rent income and lease history supplied directly (property manager's leased-properties report).",
    dateAdded: "2026-08-19",
  },
  {
    id: "3-richmond-cres-werribee-3030",
    address: "3 Richmond Cres, Werribee VIC 3030 (Units 4, 7, 8)",
    suburbId: "werribee-3030",
    lat: -37.8946994,
    lng: 144.6569612,
    rooms: [
      { label: "Unit 4", weeklyRate: 300, status: "tenanted", note: "Leased from 13 Aug 2026" },
      { label: "Unit 7", weeklyRate: 340, status: "tenanted", note: "Leased from 1 Dec 2025" },
      { label: "Unit 8", weeklyRate: 350, status: "tenanted", note: "Leased from 16 Sep 2025" },
    ],
    avgWeeklyRate: 330,
    sourceNote: "Real rent income and lease history supplied directly (property manager's leased-properties report).",
    dateAdded: "2026-08-19",
  },
  {
    id: "41-edgar-st-werribee-3030",
    address: "41 Edgar St, Werribee VIC 3030 (Unit 4)",
    suburbId: "werribee-3030",
    lat: -37.8989458,
    lng: 144.6462859,
    rooms: [{ label: "Unit 4", weeklyRate: 380, status: "tenanted", note: "Leased from 6 Nov 2025" }],
    avgWeeklyRate: 380,
    sourceNote: "Real rent income supplied directly (property manager's leased-properties report).",
    dateAdded: "2026-08-19",
  },
  {
    id: "5-gavan-ct-werribee-3030",
    address: "5 Gavan Ct, Werribee VIC 3030 (Units 3, 6)",
    suburbId: "werribee-3030",
    lat: -37.8908757,
    lng: 144.6567978,
    rooms: [
      { label: "Unit 3", weeklyRate: 350, status: "tenanted", note: "Leased from 13 Oct 2025" },
      { label: "Unit 6", weeklyRate: 350, status: "tenanted", note: "Leased from 14 May 2026" },
    ],
    avgWeeklyRate: 350,
    sourceNote: "Real rent income and lease history supplied directly (property manager's leased-properties report).",
    dateAdded: "2026-08-19",
  },
  {
    id: "55-oneills-rd-melton-3337",
    address: "55 O'Neills Rd, Melton VIC 3337 (Units 1, 2, 3, 8, 9)",
    suburbId: "melton-3337",
    lat: -37.6781157,
    lng: 144.5773415,
    rooms: [
      { label: "Unit 1", weeklyRate: 300, status: "tenanted", note: "Leased from 19 May 2026" },
      { label: "Unit 2", weeklyRate: 335, status: "tenanted", note: "Leased from 24 Feb 2026" },
      { label: "Unit 3", weeklyRate: 335, status: "tenanted", note: "Leased from 19 Jun 2026" },
      { label: "Unit 8", weeklyRate: 335, status: "tenanted", note: "Leased from 8 Jan 2026" },
      { label: "Unit 9", weeklyRate: 310, status: "tenanted", note: "Leased from 27 May 2026" },
    ],
    avgWeeklyRate: 323,
    sourceNote:
      "Real rent income and lease history supplied directly (property manager's leased-properties report). Not in the CAV register scrape used elsewhere for address-book data — confirmed as a real rooming house directly by the property manager.",
    dateAdded: "2026-08-19",
  },
  {
    id: "71-duncans-rd-werribee-3030",
    address: "71 Duncans Rd, Werribee VIC 3030 (Unit 2)",
    suburbId: "werribee-3030",
    lat: -37.9076592,
    lng: 144.6728257,
    rooms: [{ label: "Unit 2", weeklyRate: 375, status: "tenanted", note: "Leased from 11 Aug 2026" }],
    avgWeeklyRate: 375,
    sourceNote:
      "Real rent income supplied directly (property manager's leased-properties report). Not in the CAV register scrape used elsewhere for address-book data — confirmed as a real rooming house directly by the property manager.",
    dateAdded: "2026-08-19",
  },
  {
    id: "42-albert-cres-st-albans-3021",
    address: "42 Albert Cres, St Albans VIC 3021 (Units 1, 5, 6, 7, 8)",
    suburbId: "st-albans-3021",
    lat: -37.7408906,
    lng: 144.7964292,
    rooms: [
      { label: "Unit 1", weeklyRate: 385, status: "tenanted", note: "Leased from 14 May 2026" },
      { label: "Unit 5", weeklyRate: 350, status: "tenanted", note: "Leased from 20 Oct 2025" },
      { label: "Unit 6", weeklyRate: 400, status: "tenanted", note: "Leased from 29 Sep 2025" },
      { label: "Unit 7", weeklyRate: 375, status: "tenanted", note: "Leased from 29 Oct 2025" },
      { label: "Unit 8", weeklyRate: 375, status: "tenanted", note: "Leased from 29 Sep 2025" },
    ],
    avgWeeklyRate: 377,
    sourceNote:
      "Real rent income and lease history supplied directly (property manager's leased-properties report). Not in the CAV register scrape used elsewhere for address-book data — confirmed as a real rooming house directly by the property manager.",
    dateAdded: "2026-08-19",
  },
  {
    id: "24-laha-cres-preston-3072",
    address: "24 Laha Cres, Preston VIC 3072",
    suburbId: "preston-3072",
    lat: -37.7341268,
    lng: 145.0261464,
    rooms: [{ label: "Room 1", weeklyRate: 385, status: "tenanted" }],
    avgWeeklyRate: 385,
    sourceNote: "Real rent income supplied directly.",
    dateAdded: "2026-08-19",
  },
  {
    id: "3-black-knight-way-kurunjang-3337",
    address: "3 Black Knight Way, Kurunjang VIC 3337",
    suburbId: "kurunjang-3337",
    lat: -37.6630114,
    lng: 144.5901408,
    rooms: [{ label: "Room 1", weeklyRate: 350, status: "tenanted" }],
    avgWeeklyRate: 350,
    sourceNote: "Real rent income supplied directly.",
    dateAdded: "2026-08-19",
  },
  {
    id: "20-sutalo-st-marshall-3216",
    address: "20 Sutalo St, Marshall VIC 3216",
    suburbId: "marshall-3216",
    lat: -38.196066,
    lng: 144.3532229,
    rooms: [
      { label: "Room 1", weeklyRate: 395, status: "tenanted", note: "Leased Aug 2026 (confirmed via Domain.com.au) — exact final rate not publicly disclosed, showing original advertised rate" },
    ],
    avgWeeklyRate: 395,
    sourceNote:
      "Advertised asking rate supplied directly, since leased and confirmed via Domain.com.au — the site did not disclose the exact final rate, so the original advertised rate is shown.",
    dateAdded: "2026-08-19",
  },
  {
    id: "7-lansell-pl-melton-west-3337",
    address: "7 Lansell Pl, Melton West VIC 3337",
    suburbId: "melton-west-3337",
    lat: -37.6765662,
    lng: 144.5663057,
    rooms: [
      { label: "Room 1", weeklyRate: 390, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 390,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-19",
  },
  {
    id: "3-irving-rd-melton-3337",
    address: "3 Irving Rd, Melton VIC 3337",
    suburbId: "melton-3337",
    lat: -37.6884293,
    lng: 144.568199,
    rooms: [
      { label: "Room 1", weeklyRate: 380, status: "vacant", note: "Advertised, not yet tenanted — asking rate updated to $380/wk per current listing" },
    ],
    avgWeeklyRate: 380,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-19",
  },
  {
    id: "25-argyle-cres-werribee-3030",
    address: "25 Argyle Cres, Werribee VIC 3030",
    suburbId: "werribee-3030",
    lat: -37.8846486,
    lng: 144.6671049,
    rooms: [
      { label: "Room 1", weeklyRate: 330, status: "tenanted", note: "Leased Aug 2026 (confirmed via Domain.com.au) — exact final rate not publicly disclosed, showing original advertised rate" },
    ],
    avgWeeklyRate: 330,
    sourceNote:
      "Advertised asking rate supplied directly, since leased and confirmed via Domain.com.au — the site did not disclose the exact final rate, so the original advertised rate is shown.",
    dateAdded: "2026-08-19",
  },
  {
    id: "30-showers-st-braybrook-3019",
    address: "30 Showers St, Braybrook VIC 3019",
    suburbId: "braybrook-3019",
    lat: -37.7927972,
    lng: 144.8514078,
    rooms: [{ label: "Room 1", weeklyRate: 415, status: "tenanted" }],
    avgWeeklyRate: 415,
    sourceNote: "Real rent income supplied directly.",
    dateAdded: "2026-08-19",
  },
  {
    id: "2-76-kiora-st-altona-meadows-3028",
    address: "2/76 Kiora St, Altona Meadows VIC 3028",
    suburbId: "altona-meadows-3028",
    lat: -37.8707432,
    lng: 144.7751851,
    rooms: [
      { label: "Unit 2", weeklyRate: 410, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 410,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-19",
  },
  {
    id: "50-paley-dr-corio-3214",
    address: "50 Paley Dr, Corio VIC 3214",
    suburbId: "corio-3214",
    lat: -38.0737665,
    lng: 144.3472887,
    rooms: [
      { label: "Room 1", weeklyRate: 395, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 395,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-19",
  },
  {
    id: "34a-rowe-st-golden-square-3555",
    address: "34a Rowe St, Golden Square VIC 3555",
    suburbId: "golden-square-3555",
    lat: -36.7773378,
    lng: 144.2639387,
    rooms: [
      { label: "Room 1", weeklyRate: 440, status: "vacant", note: "Advertised, not yet tenanted" },
    ],
    avgWeeklyRate: 440,
    sourceNote:
      "Advertised asking rate supplied directly — currently looking for a tenant, not yet rented. Room count for the rest of the property isn't known yet.",
    dateAdded: "2026-08-19",
  },
  {
    id: "13-pine-st-frankston-north-3200",
    address: "13 Pine St, Frankston North VIC 3200",
    suburbId: "frankston-north-3200",
    lat: -38.1246745,
    lng: 145.1425695,
    rooms: [
      { label: "Room 1", weeklyRate: 350, status: "tenanted", note: "Last leased 20 May 2025" },
    ],
    avgWeeklyRate: 350,
    sourceNote: "Real rent income supplied directly.",
    dateAdded: "2026-08-29",
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

// A property counts as "tenanted" (confirmed real rent) if any room is actually
// tenanted, even if others are vacant/advertised — one proven rate outweighs an
// unconfirmed asking price. Otherwise it's "advertised" (asking price, not yet rented).
export function getPropertyConfirmationStatus(
  property: PropertyRental
): "tenanted" | "advertised" {
  return property.rooms.some((r) => r.status === "tenanted") ? "tenanted" : "advertised";
}
