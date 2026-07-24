// Sample B2C room listings — the "someone looking for a room" side of the
// platform, distinct from the investor tooling. Public, no login required.
// Brief/sample data for now: a handful of listings across a few suburbs.

export type RoomListing = {
  id: string;
  suburbId: string; // matches Suburb.id in lib/mock-data.ts
  suburbName: string;
  address?: string; // street address, only set for listings with real photos
  roomType: "Single" | "Shared";
  weeklyRate: number;
  availableFrom: string;
  description: string;
  photos?: string[]; // real photos, in display order — first is the room itself, not the house
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
    address: "15 Grace Street, St Albans",
    roomType: "Single",
    weeklyRate: 380,
    availableFrom: "Available now",
    description:
      "Immaculately presented studio room in a near-new, purpose-built rooming house — a rare standard for the area. This light-filled room is fully self-contained with its own kitchenette, reverse-cycle split-system air conditioning, built-in mirrored robe, and a private study nook, all finished with quality laminate flooring throughout. Residents also enjoy a large shared kitchen and dining space, perfect for entertaining or unwinding after work. Positioned in a quiet, well-maintained street close to St Albans station, Chinatown's shops and eateries, and local bus routes. Presented in outstanding condition and available now — inspections highly recommended, this one won't last.",
    photos: ["/listings/st-albans-example/room.jpg", "/listings/st-albans-example/kitchen.jpg"],
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

export function getListingById(id: string) {
  return mockListings.find((l) => l.id === id);
}
