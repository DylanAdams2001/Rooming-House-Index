// Real, address-level rent data for specific rooming houses — supplied directly
// (sale flyers, rent rolls), not estimated. Distinct from lib/mock-data.ts's
// suburb-wide averages: this is what a single property's rooms actually rent for.
export type PropertyRoomRental = {
  label: string;
  weeklyRate: number;
  status: "tenanted" | "vacant" | "under-application";
  note?: string;
};

export type PropertyRental = {
  id: string;
  address: string;
  suburbId: string;
  lat: number;
  lng: number;
  rooms: PropertyRoomRental[];
  avgWeeklyRate: number;
  sourceNote: string;
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
        status: "tenanted",
        note: "Own private ensuite",
      },
      { label: "Room 2", weeklyRate: 290, status: "tenanted" },
      { label: "Room 3", weeklyRate: 290, status: "tenanted" },
      { label: "Room 4", weeklyRate: 290, status: "tenanted" },
      { label: "Room 5", weeklyRate: 290, status: "tenanted" },
      { label: "Room 6", weeklyRate: 340, status: "tenanted" },
      { label: "Room 7", weeklyRate: 300, status: "tenanted" },
      { label: "Room 8", weeklyRate: 290, status: "tenanted" },
    ],
    avgWeeklyRate: 305,
    sourceNote:
      "Published room rates, listing dated 11 Aug 2026 (bills & internet included). Occupancy status wasn't specified in the source, so rooms are shown as tenanted by default. Map pin is the Manor Lakes area centroid, not the exact street — Nicholii Ct isn't in the CAV register or mapping services yet (likely a very recently built street).",
  },
];

export function getPropertyRentalsForSuburb(suburbId: string) {
  return propertyRentals.filter((p) => p.suburbId === suburbId);
}

export function getPropertyRentalById(id: string) {
  return propertyRentals.find((p) => p.id === id);
}
