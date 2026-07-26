import type { RoomListing } from "@/lib/mock-listings";

export type ListingRow = {
  id: string;
  suburb_id: string;
  suburb_name: string;
  address: string;
  address_verified: boolean;
  lat: number | null;
  lng: number | null;
  room_type: string;
  weekly_rate: number;
  available_from: string;
  description: string;
  photos: string[];
  inspection_time: string | null;
};

export const LISTING_COLUMNS =
  "id, suburb_id, suburb_name, address, address_verified, lat, lng, room_type, weekly_rate, available_from, description, photos, inspection_time";

export function mapListingRow(row: ListingRow): RoomListing {
  return {
    id: row.id,
    suburbId: row.suburb_id,
    suburbName: row.suburb_name,
    address: row.address,
    addressVerified: row.address_verified,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    roomType: row.room_type as RoomListing["roomType"],
    weeklyRate: row.weekly_rate,
    availableFrom: row.available_from,
    description: row.description,
    photos: row.photos ?? [],
    inspectionTime: row.inspection_time ?? undefined,
  };
}
