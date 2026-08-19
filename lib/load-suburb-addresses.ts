export type AddressPoint = {
  street: string;
  lat: number;
  lng: number;
};

// Individual rooming house addresses, split into one JSON file per postcode
// (lib/data/addresses/<postcode>.json) so the map only loads the ~5-50 points
// for a suburb the user actually drills into, not all ~1960 addresses at once.
//
// A postcode can genuinely cover several distinct real suburbs (e.g. 3021
// spans both St Albans and Albanvale) — the CAV register source data has no
// per-address locality, only postcode, so most suburbs still share one file.
// When a suburb has been reverse-geocoded and split out on its own, its
// addresses live in a file keyed by suburb id instead (e.g.
// lib/data/addresses/albanvale-3021.json) — tried first, falling back to the
// shared postcode file so every other, unsplit suburb keeps working as-is.
export async function loadSuburbAddresses(suburbId: string, postcode: string): Promise<AddressPoint[]> {
  try {
    const mod = await import(`./data/addresses/${suburbId}.json`);
    return mod.default as AddressPoint[];
  } catch {
    // Falls through to the shared postcode file below.
  }
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
    // Strip everything up to the first capitalised word — handles plain numbers ("103 Barkly
    // Street"), unit-letter prefixes ("29a Empire St"), and number ranges ("98-100 Moreland
    // Street") in one pass, since street *names* always start with a capital letter.
    const streetName = a.street.replace(/^[^A-Z]+/, "").trim() || a.street;
    counts.set(streetName, (counts.get(streetName) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([street, count]) => ({ street, count }))
    .sort((a, b) => b.count - a.count || a.street.localeCompare(b.street));
}
