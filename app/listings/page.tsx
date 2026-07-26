import { ListingsBrowser } from "@/components/listings-browser";
import { getApprovedListings } from "@/lib/listings";

export default async function ListingsPage() {
  const listings = await getApprovedListings();
  return <ListingsBrowser listings={listings} />;
}
