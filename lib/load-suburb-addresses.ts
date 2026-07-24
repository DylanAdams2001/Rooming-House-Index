export type AddressPoint = {
  street: string;
  lat: number;
  lng: number;
};

// Individual rooming house addresses, split into one JSON file per postcode
// (lib/data/addresses/<postcode>.json) so the map only loads the ~5-50 points
// for a suburb the user actually drills into, not all ~1960 addresses at once.
export async function loadSuburbAddresses(postcode: string): Promise<AddressPoint[]> {
  try {
    const mod = await import(`./data/addresses/${postcode}.json`);
    return mod.default as AddressPoint[];
  } catch {
    return [];
  }
}

export function groupByStreet(addresses: AddressPoint[]) {
  const counts = new Map<string, number>();
  for (const a of addresses) {
    // Strip the leading street number so "103 Barkly Street" and "45 Barkly Street" group together.
    const streetName = a.street.replace(/^[\d/]+[\s]*/, "").trim() || a.street;
    counts.set(streetName, (counts.get(streetName) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([street, count]) => ({ street, count }))
    .sort((a, b) => b.count - a.count || a.street.localeCompare(b.street));
}
