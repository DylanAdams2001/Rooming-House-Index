// Sample B2C room listings — the "someone looking for a room" side of the
// platform, distinct from the investor tooling. Public, no login required.
// Demo data: photos are real interior/exterior shots from an actual rooming
// house build (supplied by the client), mixed into varied sets per listing —
// not claiming each listing's specific room, since addresses besides St
// Albans' are placeholders, but real photography rather than illustration.

export type RoomListing = {
  id: string;
  suburbId: string; // matches Suburb.id in lib/mock-data.ts
  suburbName: string;
  address: string; // street address — used as the listing's title so multiple
  // listings in the same suburb aren't ambiguous in cards/messages/enquiries.
  // Only St Albans' is a real, verified address; the rest are placeholder
  // addresses for these demo listings, same spirit as the shared demo photos.
  addressVerified?: boolean;
  // Exact geocoded coordinates from the property manager's address selection —
  // when present, the listing map pins the real address instead of falling
  // back to the suburb's centroid.
  lat?: number;
  lng?: number;
  roomType: "Single" | "Shared";
  weeklyRate: number;
  availableFrom: string;
  description: string;
  photos?: string[]; // display order — first is the room itself, not the house
  inspectionTime?: string; // e.g. "Saturday 25 Jul, 10:00am - 10:30am"
};

const STA = "/listings/st-albans-example";
const D = "/listings/dandenong-example";

const BEDROOMS = [`${D}/bedroom-1.jpg`, `${D}/bedroom-2.jpg`, `${D}/bedroom-3.jpg`, `${D}/bedroom-4.jpg`];
const COMMON_SPACES = [
  `${D}/kitchenette-1.jpg`,
  `${D}/kitchenette-2.jpg`,
  `${D}/kitchen-dining.jpg`,
  `${D}/common-dining-laundry.jpg`,
];

export const mockListings: RoomListing[] = [
  {
    id: "listing-st-albans-1",
    suburbId: "st-albans-3021",
    suburbName: "St Albans",
    address: "15 Grace Street, St Albans",
    addressVerified: true,
    roomType: "Single",
    weeklyRate: 380,
    availableFrom: "Available now",
    description:
      "Immaculately presented studio room in a near-new, purpose-built rooming house — a rare standard for the area. This light-filled room is fully self-contained with its own kitchenette, reverse-cycle split-system air conditioning, built-in mirrored robe, and a private study nook, all finished with quality laminate flooring throughout. Residents also enjoy a large shared kitchen and dining space, perfect for entertaining or unwinding after work. Positioned in a quiet, well-maintained street close to St Albans station, Chinatown's shops and eateries, and local bus routes. Presented in outstanding condition and available now — inspections highly recommended, this one won't last.",
    photos: [`${STA}/room.jpg`, `${STA}/kitchen.jpg`],
    inspectionTime: "Saturday 25 Jul, 10:00am - 10:30am",
  },
  {
    id: "listing-footscray-1",
    suburbId: "footscray-3011",
    suburbName: "Footscray",
    address: "8 Nicholson Street, Footscray",
    roomType: "Single",
    weeklyRate: 350,
    availableFrom: "Available now",
    description: "Furnished single room, close to Footscray station and Vic Uni campus. Bills included.",
    photos: [BEDROOMS[0], COMMON_SPACES[0]],
    inspectionTime: "Saturday 25 Jul, 11:00am - 11:30am",
  },
  {
    id: "listing-footscray-2",
    suburbId: "footscray-3011",
    suburbName: "Footscray",
    address: "142 Barkly Street, Footscray",
    roomType: "Shared",
    weeklyRate: 350,
    availableFrom: "Available 1 Aug",
    description: "Shared twin room in a quiet 6-room house. Walking distance to Barkly Street shops.",
    photos: [BEDROOMS[1], COMMON_SPACES[1]],
  },
  {
    id: "listing-werribee-1",
    suburbId: "werribee-3030",
    suburbName: "Werribee",
    address: "21 Watton Street, Werribee",
    roomType: "Single",
    weeklyRate: 350,
    availableFrom: "Available now",
    description: "Bright single room near Werribee Plaza. Off-street parking available.",
    photos: [BEDROOMS[2], COMMON_SPACES[2]],
  },
  {
    id: "listing-werribee-2",
    suburbId: "werribee-3030",
    suburbName: "Werribee",
    address: "5 Comben Drive, Werribee",
    roomType: "Single",
    weeklyRate: 350,
    availableFrom: "Available 15 Aug",
    description: "Recently renovated room, walking distance to Werribee station.",
    photos: [BEDROOMS[3], COMMON_SPACES[3]],
  },
  {
    id: "listing-clayton-1",
    suburbId: "clayton-3168",
    suburbName: "Clayton",
    address: "33 Carinish Road, Clayton",
    roomType: "Single",
    weeklyRate: 350,
    availableFrom: "Available now",
    description: "Student-friendly single room, 5 minutes' walk to Monash University Clayton campus.",
    photos: [BEDROOMS[0], COMMON_SPACES[2]],
    inspectionTime: "Saturday 25 Jul, 1:00pm - 1:30pm",
  },
  {
    id: "listing-clayton-2",
    suburbId: "clayton-3168",
    suburbName: "Clayton",
    address: "97 Clayton Road, Clayton",
    roomType: "Shared",
    weeklyRate: 350,
    availableFrom: "Available now",
    description: "Shared room in a well-maintained 8-room house, all bills and NBN included.",
    photos: [BEDROOMS[1], COMMON_SPACES[3]],
  },
  {
    id: "listing-dandenong-1",
    suburbId: "dandenong-3175",
    suburbName: "Dandenong",
    address: "14 Foster Street, Dandenong",
    roomType: "Single",
    weeklyRate: 350,
    availableFrom: "Available now",
    description: "Modern single room near Dandenong Market, close to bus interchange.",
    photos: [BEDROOMS[2], COMMON_SPACES[0], `${D}/facade-sunset.jpg`],
  },
  {
    id: "listing-sunshine-1",
    suburbId: "sunshine-3020",
    suburbName: "Sunshine",
    address: "6 Hampshire Road, Sunshine",
    roomType: "Single",
    weeklyRate: 350,
    availableFrom: "Available now",
    description: "Spacious single room, 8 minutes' walk to Sunshine station. Onsite laundry.",
    photos: [BEDROOMS[3], COMMON_SPACES[1]],
  },
  {
    id: "listing-sunshine-2",
    suburbId: "sunshine-3020",
    suburbName: "Sunshine",
    address: "58 Anderson Road, Sunshine",
    roomType: "Shared",
    weeklyRate: 350,
    availableFrom: "Available 1 Aug",
    description: "Shared room in a renovated 7-room house near Sunshine Marketplace.",
    photos: [BEDROOMS[0], `${D}/bathroom.jpg`],
  },
  {
    id: "listing-broadmeadows-1",
    suburbId: "broadmeadows-3047",
    suburbName: "Broadmeadows",
    address: "19 Dimboola Road, Broadmeadows",
    roomType: "Single",
    weeklyRate: 350,
    availableFrom: "Available now",
    description: "Single room close to Broadmeadows station and Hume Central shopping centre.",
    photos: [BEDROOMS[1], COMMON_SPACES[0]],
  },
  {
    id: "listing-reservoir-1",
    suburbId: "reservoir-3073",
    suburbName: "Reservoir",
    address: "11 Broadhurst Avenue, Reservoir",
    roomType: "Single",
    weeklyRate: 350,
    availableFrom: "Available 1 Aug",
    description: "Quiet single room in a well-kept house, close to Edwardes Lake Park.",
    photos: [BEDROOMS[2], COMMON_SPACES[1]],
  },
  {
    id: "listing-frankston-1",
    suburbId: "frankston-3199",
    suburbName: "Frankston",
    address: "27 Beach Street, Frankston",
    roomType: "Single",
    weeklyRate: 350,
    availableFrom: "Available now",
    description: "Single room 10 minutes' walk from Frankston station and the beach.",
    photos: [BEDROOMS[3], COMMON_SPACES[2]],
    inspectionTime: "Saturday 25 Jul, 2:00pm - 2:30pm",
  },
  {
    id: "listing-altona-1",
    suburbId: "altona-3018",
    suburbName: "Altona",
    address: "4 Queen Street, Altona",
    roomType: "Single",
    weeklyRate: 350,
    availableFrom: "Available now",
    description: "Bright single room in a quiet street, short drive to Altona beach and station.",
    photos: [BEDROOMS[0], COMMON_SPACES[1], `${D}/facade-gate.jpg`],
  },
  {
    id: "listing-springvale-1",
    suburbId: "springvale-3171",
    suburbName: "Springvale",
    address: "70 Springvale Road, Springvale",
    roomType: "Shared",
    weeklyRate: 350,
    availableFrom: "Available now",
    description: "Shared room close to Springvale station and the shopping precinct on Springvale Road.",
    photos: [BEDROOMS[1], COMMON_SPACES[2]],
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

// The one identifier used consistently across cards, listing detail, enquiries,
// and messages — the address, since suburb + room type alone is ambiguous once
// there's more than one listing in the same suburb.
export function getListingTitle(listing: RoomListing) {
  return listing.address;
}
