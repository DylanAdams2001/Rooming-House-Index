// Sample B2C room listings — the "someone looking for a room" side of the
// platform, distinct from the investor tooling. Public, no login required.
// Brief/sample data for now: a handful of listings across a few suburbs.

export type RoomListing = {
  id: string;
  suburbId: string; // matches Suburb.id in lib/mock-data.ts
  suburbName: string;
  roomType: "Single" | "Shared";
  weeklyRate: number;
  availableFrom: string;
  description: string;
};

export const mockListings: RoomListing[] = [
  {
    id: "listing-footscray-1",
    suburbId: "footscray-3011",
    suburbName: "Footscray",
    roomType: "Single",
    weeklyRate: 240,
    availableFrom: "Available now",
    description: "Furnished single room, close to Footscray station and Vic Uni campus. Bills included.",
  },
  {
    id: "listing-footscray-2",
    suburbId: "footscray-3011",
    suburbName: "Footscray",
    roomType: "Shared",
    weeklyRate: 165,
    availableFrom: "Available 1 Aug",
    description: "Shared twin room in a quiet 6-room house. Walking distance to Barkly Street shops.",
  },
  {
    id: "listing-werribee-1",
    suburbId: "werribee-3030",
    suburbName: "Werribee",
    roomType: "Single",
    weeklyRate: 175,
    availableFrom: "Available now",
    description: "Bright single room near Werribee Plaza. Off-street parking available.",
  },
  {
    id: "listing-werribee-2",
    suburbId: "werribee-3030",
    suburbName: "Werribee",
    roomType: "Single",
    weeklyRate: 190,
    availableFrom: "Available 15 Aug",
    description: "Recently renovated room, walking distance to Werribee station.",
  },
  {
    id: "listing-clayton-1",
    suburbId: "clayton-3168",
    suburbName: "Clayton",
    roomType: "Single",
    weeklyRate: 265,
    availableFrom: "Available now",
    description: "Student-friendly single room, 5 minutes' walk to Monash University Clayton campus.",
  },
  {
    id: "listing-clayton-2",
    suburbId: "clayton-3168",
    suburbName: "Clayton",
    roomType: "Shared",
    weeklyRate: 150,
    availableFrom: "Available now",
    description: "Shared room in a well-maintained 8-room house, all bills and NBN included.",
  },
  {
    id: "listing-st-albans-1",
    suburbId: "st-albans-3021",
    suburbName: "St Albans",
    roomType: "Single",
    weeklyRate: 190,
    availableFrom: "Available 1 Sep",
    description: "Quiet single room close to St Albans station and Chinatown shops.",
  },
  {
    id: "listing-dandenong-1",
    suburbId: "dandenong-3175",
    suburbName: "Dandenong",
    roomType: "Single",
    weeklyRate: 215,
    availableFrom: "Available now",
    description: "Modern single room near Dandenong Market, close to bus interchange.",
  },
];

export function getListingsBySuburb(suburbId: string) {
  return mockListings.filter((l) => l.suburbId === suburbId);
}
