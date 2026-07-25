// Sample B2C room listings — the "someone looking for a room" side of the
// platform, distinct from the investor tooling. Public, no login required.
// Demo data: every listing reuses the same real interior photo set so the
// grid is easy to browse while more properties get photographed individually.

export type RoomListing = {
  id: string;
  suburbId: string; // matches Suburb.id in lib/mock-data.ts
  suburbName: string;
  address?: string; // street address, only set for listings with a real, verified address
  roomType: "Single" | "Shared";
  weeklyRate: number;
  availableFrom: string;
  description: string;
  photos?: string[]; // display order — first is the room itself, not the house
  inspectionTime?: string; // e.g. "Saturday 25 Jul, 10:00am - 10:30am"
};

const DEMO_PHOTOS = ["/listings/st-albans-example/room.jpg", "/listings/st-albans-example/kitchen.jpg"];

export const mockListings: RoomListing[] = [
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
    photos: DEMO_PHOTOS,
    inspectionTime: "Saturday 25 Jul, 10:00am - 10:30am",
  },
  {
    id: "listing-footscray-1",
    suburbId: "footscray-3011",
    suburbName: "Footscray",
    roomType: "Single",
    weeklyRate: 240,
    availableFrom: "Available now",
    description: "Furnished single room, close to Footscray station and Vic Uni campus. Bills included.",
    photos: DEMO_PHOTOS,
    inspectionTime: "Saturday 25 Jul, 11:00am - 11:30am",
  },
  {
    id: "listing-footscray-2",
    suburbId: "footscray-3011",
    suburbName: "Footscray",
    roomType: "Shared",
    weeklyRate: 165,
    availableFrom: "Available 1 Aug",
    description: "Shared twin room in a quiet 6-room house. Walking distance to Barkly Street shops.",
    photos: DEMO_PHOTOS,
  },
  {
    id: "listing-werribee-1",
    suburbId: "werribee-3030",
    suburbName: "Werribee",
    roomType: "Single",
    weeklyRate: 175,
    availableFrom: "Available now",
    description: "Bright single room near Werribee Plaza. Off-street parking available.",
    photos: DEMO_PHOTOS,
  },
  {
    id: "listing-werribee-2",
    suburbId: "werribee-3030",
    suburbName: "Werribee",
    roomType: "Single",
    weeklyRate: 190,
    availableFrom: "Available 15 Aug",
    description: "Recently renovated room, walking distance to Werribee station.",
    photos: DEMO_PHOTOS,
  },
  {
    id: "listing-clayton-1",
    suburbId: "clayton-3168",
    suburbName: "Clayton",
    roomType: "Single",
    weeklyRate: 265,
    availableFrom: "Available now",
    description: "Student-friendly single room, 5 minutes' walk to Monash University Clayton campus.",
    photos: DEMO_PHOTOS,
    inspectionTime: "Saturday 25 Jul, 1:00pm - 1:30pm",
  },
  {
    id: "listing-clayton-2",
    suburbId: "clayton-3168",
    suburbName: "Clayton",
    roomType: "Shared",
    weeklyRate: 150,
    availableFrom: "Available now",
    description: "Shared room in a well-maintained 8-room house, all bills and NBN included.",
    photos: DEMO_PHOTOS,
  },
  {
    id: "listing-dandenong-1",
    suburbId: "dandenong-3175",
    suburbName: "Dandenong",
    roomType: "Single",
    weeklyRate: 215,
    availableFrom: "Available now",
    description: "Modern single room near Dandenong Market, close to bus interchange.",
    photos: DEMO_PHOTOS,
  },
  {
    id: "listing-sunshine-1",
    suburbId: "sunshine-3020",
    suburbName: "Sunshine",
    roomType: "Single",
    weeklyRate: 230,
    availableFrom: "Available now",
    description: "Spacious single room, 8 minutes' walk to Sunshine station. Onsite laundry.",
    photos: DEMO_PHOTOS,
  },
  {
    id: "listing-sunshine-2",
    suburbId: "sunshine-3020",
    suburbName: "Sunshine",
    roomType: "Shared",
    weeklyRate: 160,
    availableFrom: "Available 1 Aug",
    description: "Shared room in a renovated 7-room house near Sunshine Marketplace.",
    photos: DEMO_PHOTOS,
  },
  {
    id: "listing-broadmeadows-1",
    suburbId: "broadmeadows-3047",
    suburbName: "Broadmeadows",
    roomType: "Single",
    weeklyRate: 195,
    availableFrom: "Available now",
    description: "Single room close to Broadmeadows station and Hume Central shopping centre.",
    photos: DEMO_PHOTOS,
  },
  {
    id: "listing-reservoir-1",
    suburbId: "reservoir-3073",
    suburbName: "Reservoir",
    roomType: "Single",
    weeklyRate: 220,
    availableFrom: "Available 1 Aug",
    description: "Quiet single room in a well-kept house, close to Edwardes Lake Park.",
    photos: DEMO_PHOTOS,
  },
  {
    id: "listing-frankston-1",
    suburbId: "frankston-3199",
    suburbName: "Frankston",
    roomType: "Single",
    weeklyRate: 210,
    availableFrom: "Available now",
    description: "Single room 10 minutes' walk from Frankston station and the beach.",
    photos: DEMO_PHOTOS,
    inspectionTime: "Saturday 25 Jul, 2:00pm - 2:30pm",
  },
  {
    id: "listing-altona-1",
    suburbId: "altona-3018",
    suburbName: "Altona",
    roomType: "Single",
    weeklyRate: 225,
    availableFrom: "Available now",
    description: "Bright single room in a quiet street, short drive to Altona beach and station.",
    photos: DEMO_PHOTOS,
  },
  {
    id: "listing-springvale-1",
    suburbId: "springvale-3171",
    suburbName: "Springvale",
    roomType: "Shared",
    weeklyRate: 155,
    availableFrom: "Available now",
    description: "Shared room close to Springvale station and the shopping precinct on Springvale Road.",
    photos: DEMO_PHOTOS,
  },
];

export function getListingsBySuburb(suburbId: string) {
  return mockListings.filter((l) => l.suburbId === suburbId);
}

export function getListingById(id: string) {
  return mockListings.find((l) => l.id === id);
}

export function getFeaturedListings(count: number) {
  return mockListings.slice(0, count);
}
