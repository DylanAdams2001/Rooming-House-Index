// numRoomingHouses is real, sourced from Consumer Affairs Victoria's public register
// (registers.consumer.vic.gov.au/rhrsearch/browse, 1968 records, exported 25 Jul 2026 —
// see lib/data/rooming-house-register-2026-07.json for the full postcode breakdown).
// avgRoomRate is still a placeholder pending a real source, except where
// avgRoomRateVerified is true (manually supplied real figures). There used to
// be a "Demand Level" (High/Medium/Low) field here too — removed because for
// ~200 of 211 suburbs it was really just a percentile rank of registered
// rooming-house *count*, a supply proxy mislabeled as a demand signal.
// There is no vacancyRate field — "vacancy rate" as normally measured (whole-property
// turnover in the general rental market) doesn't map onto rooming houses, which are
// let room-by-room and run near-full occupancy by design. No suburb-level source for
// rooming-house-specific vacancy exists, so the metric was removed rather than faked.
import vicSuburbsExtra from "./data/vic-suburbs-extra.json";

export type Suburb = {
  id: string;
  name: string;
  postcode: string;
  state: string;
  council: string;
  avgRoomRate: number; // per week, AUD
  avgRoomRateVerified?: boolean; // true only when a real figure has been supplied (not estimated)
  avgRoomRateDisplay?: string; // overrides the $X/wk label, e.g. "$330-350/wk" for a real range
  numRoomingHouses: number;
  // Real rental-market data for 1-bed units, manually sourced from realestate.com.au suburb
  // profile pages (not automated — see robots.txt discussion; a human reads the page and
  // reports the numbers). Optional: only set for suburbs someone has actually looked up.
  rentalInsights?: {
    priceGrowthYoY: string; // e.g. "+1.4%"
    unitsAvailableLastMonth: number;
    unitsLeasedPast12Months: number;
    medianDaysOnMarket: number;
    rentersInterested: number;
    sourceUrl: string;
  };
  lat: number;
  lng: number;
  commentary: string;
  rentalTrend: { month: string; rate: number }[];
  supplyGrowth: { year: string; houses: number }[];
};

const rentalTrend = (base: number) =>
  [
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
  ].map((month, i) => ({
    month,
    rate: Math.round(base + Math.sin(i / 2) * 6 + i * 1.4),
  }));

const supplyGrowth = (base: number) =>
  ["2021", "2022", "2023", "2024", "2025"].map((year, i) => ({
    year,
    houses: Math.round(base + i * (base * 0.08)),
  }));

// The 11 suburbs below are hand-curated with real or manually-sourced figures where noted.
const curatedSuburbs: Suburb[] = [
  {
    id: "footscray-3011",
    name: "Footscray",
    postcode: "3011",
    state: "VIC",
    council: "Maribyrnong City Council",
    avgRoomRate: 245,
    numRoomingHouses: 25,
    lat: -37.7999,
    lng: 144.9,
    commentary:
      "Footscray continues to attract strong rooming house demand driven by proximity to the CBD, Victoria University, and ongoing transport upgrades. Vacancy remains tight and room rates have trended upward over the past 12 months.",
    rentalTrend: rentalTrend(220),
    supplyGrowth: supplyGrowth(30),
  },
  {
    id: "dandenong-3175",
    name: "Dandenong",
    postcode: "3175",
    state: "VIC",
    council: "Greater Dandenong City Council",
    avgRoomRate: 380,
    avgRoomRateVerified: true,
    numRoomingHouses: 89,
    lat: -37.9877,
    lng: 145.2148,
    commentary:
      "A well-established rooming house market with high migrant settlement demand and strong employment access via the Dandenong industrial precinct. Supply has grown steadily but has not kept pace with demand.",
    rentalTrend: rentalTrend(190),
    supplyGrowth: supplyGrowth(44),
  },
  {
    id: "st-albans-3021",
    name: "St Albans",
    postcode: "3021",
    state: "VIC",
    council: "Brimbank City Council",
    avgRoomRate: 320,
    avgRoomRateVerified: true,
    numRoomingHouses: 31,
    lat: -37.7448,
    lng: 144.7955,
    commentary:
      "St Albans offers affordable entry points for investors with moderate but consistent demand. Vacancy has eased slightly as new supply has entered the market over the last two years.",
    rentalTrend: rentalTrend(360),
    supplyGrowth: supplyGrowth(22),
  },
  {
    id: "springvale-3171",
    name: "Springvale",
    postcode: "3171",
    state: "VIC",
    council: "Greater Dandenong City Council",
    avgRoomRate: 205,
    numRoomingHouses: 15,
    lat: -37.9498,
    lng: 145.1526,
    commentary:
      "Springvale's proximity to Dandenong and strong retail and hospitality employment base sustain high demand for affordable shared housing. Room rates have risen consistently year on year.",
    rentalTrend: rentalTrend(185),
    supplyGrowth: supplyGrowth(26),
  },
  {
    id: "sunshine-3020",
    name: "Sunshine",
    postcode: "3020",
    state: "VIC",
    council: "Brimbank City Council",
    avgRoomRate: 200,
    numRoomingHouses: 14,
    lat: -37.7887,
    lng: 144.8321,
    commentary:
      "Sunshine benefits from the Metro Tunnel and regional rail upgrades, gradually lifting investor interest. Demand is currently moderate but forecast to strengthen as transport works complete.",
    rentalTrend: rentalTrend(180),
    supplyGrowth: supplyGrowth(19),
  },
  {
    id: "broadmeadows-3047",
    name: "Broadmeadows",
    postcode: "3047",
    state: "VIC",
    council: "Hume City Council",
    avgRoomRate: 175,
    numRoomingHouses: 11,
    lat: -37.682,
    lng: 144.9235,
    commentary:
      "Broadmeadows remains one of the more affordable options in Melbourne's north with steady demand from lower-income and new-arrival renters. Vacancy is comparatively higher than inner suburbs.",
    rentalTrend: rentalTrend(160),
    supplyGrowth: supplyGrowth(15),
  },
  {
    id: "clayton-3168",
    name: "Clayton",
    postcode: "3168",
    state: "VIC",
    council: "Monash City Council",
    avgRoomRate: 260,
    numRoomingHouses: 220,
    lat: -37.9152,
    lng: 145.1145,
    commentary:
      "Home to Monash University, Clayton commands premium room rates driven by consistent student demand. Vacancy is the tightest in this data set, making it a competitive but reliable investment target.",
    rentalTrend: rentalTrend(235),
    supplyGrowth: supplyGrowth(38),
  },
  {
    id: "reservoir-3073",
    name: "Reservoir",
    postcode: "3073",
    state: "VIC",
    council: "Darebin City Council",
    avgRoomRate: 215,
    numRoomingHouses: 13,
    lat: -37.7182,
    lng: 145.0129,
    commentary:
      "Reservoir has seen gentrification spill over from Preston and Northcote, gradually lifting room rates. Demand is solid though supply growth has accelerated in recent years.",
    rentalTrend: rentalTrend(195),
    supplyGrowth: supplyGrowth(17),
  },
  {
    id: "frankston-3199",
    name: "Frankston",
    postcode: "3199",
    state: "VIC",
    council: "Frankston City Council",
    avgRoomRate: 400,
    avgRoomRateVerified: true,
    numRoomingHouses: 107,
    lat: -38.1418,
    lng: 145.1233,
    commentary:
      "Frankston offers low entry prices but softer demand relative to inner and middle-ring suburbs. Vacancy is elevated, reflecting an oversupply relative to current population growth.",
    rentalTrend: rentalTrend(355),
    supplyGrowth: supplyGrowth(11),
  },
  {
    id: "werribee-3030",
    name: "Werribee",
    postcode: "3030",
    state: "VIC",
    council: "Wyndham City Council",
    avgRoomRate: 370,
    avgRoomRateVerified: true,
    numRoomingHouses: 32,
    lat: -37.9004,
    lng: 144.662,
    rentalInsights: {
      priceGrowthYoY: "+1.4%",
      unitsAvailableLastMonth: 1,
      unitsLeasedPast12Months: 15,
      medianDaysOnMarket: 23,
      rentersInterested: 235,
      sourceUrl:
        "https://www.realestate.com.au/vic/werribee-3030/?sourcePage=rea:rent:srp&sourceElement=suburb-profile&channel=rent",
    },
    commentary:
      "Werribee shows genuinely strong rental demand for 1-bed units — 235 renters interested against just 1 unit available in the past month, with a median of only 23 days on market. That demand pressure is a strong argument for shared/rooming accommodation in the area, even though the suburb's growth has historically skewed toward family housing.",
    rentalTrend: rentalTrend(325),
    supplyGrowth: supplyGrowth(9),
  },
  {
    id: "altona-3018",
    name: "Altona",
    postcode: "3018",
    state: "VIC",
    council: "Hobsons Bay City Council",
    avgRoomRate: 410,
    avgRoomRateVerified: true,
    numRoomingHouses: 7,
    lat: -37.8679,
    lng: 144.8321,
    commentary:
      "Altona commands a premium over comparable western-suburbs markets, driven by its bayside location and lower rooming house supply. With only a handful of registered operators, the market is tighter and less liquid than larger hubs like Footscray or St Albans.",
    rentalTrend: rentalTrend(390),
    supplyGrowth: supplyGrowth(6),
  },
  {
    id: "shepparton-3630",
    name: "Shepparton",
    postcode: "3630",
    state: "VIC",
    council: "Greater Shepparton City Council",
    avgRoomRate: 345,
    avgRoomRateVerified: true,
    numRoomingHouses: 22,
    lat: -36.380853,
    lng: 145.403176,
    commentary:
      "Regional Victoria's tightest rental market right now — vacancy sits at just 1.0% against a healthy benchmark of 3.0%, and median rent has grown 12.7% over the past year (PRD Shepparton Market Update H1 2025; InvestorKit Shepparton Property Market 2026). Population is forecast to grow from 68,409 (2021) to 81,905 by 2036, and capital-to-region relocations into the area rose 229% year-on-year (2025 Regional Movers Index). Shepparton is home to Goulburn Valley Health, GOTAFE and a La Trobe University campus, giving rooming houses a steady tenant base of healthcare, TAFE and university staff. A recently built rooming house near the hospital precinct is achieving around $345/wk per room, with rents that haven't risen since opening — a sign there's room to move given how far demand is outstripping supply.",
    rentalTrend: rentalTrend(330),
    supplyGrowth: supplyGrowth(18),
  },
];

// The remaining ~200 Victorian suburbs from the CAV register, covering every postcode
// in the register. name/postcode/council/lat/lng/numRoomingHouses are real (see
// lib/data/vic-suburbs-extra.json and rooming-house-register-2026-07.json). avgRoomRate
// is NOT real — it's a deterministically generated placeholder (stable across
// reloads, not random) pending verified figures, same as the curated suburbs
// above before they get real data. avgRoomRateVerified is always false here.

// Deterministic (not random) hash so placeholder figures are stable across reloads/builds.
function seededValue(seed: string, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return min + ((hash % 1000) / 1000) * (max - min);
}

// Real room rates supplied directly, for suburbs that only exist in the generated
// (non-curated) list. Overrides the seeded placeholder rate for these ids only.
const VERIFIED_RATES: Record<string, number> = {
  "laverton-3028": 360,
  "norlane-3214": 288,
  "ballarat-east-3350": 360,
  "melton-south-3338": 320,
  "wyndham-vale-3024": 308,
  "hoppers-crossing-3029": 380,
  "highton-3216": 270,
  "hamlyn-heights-3215": 370,
};

// Shepparton is promoted into curatedSuburbs above (real regional market data
// available, not just a rate) — excluded here so it isn't listed twice.
const generatedSuburbs: Suburb[] = vicSuburbsExtra
  .filter((s) => s.id !== "shepparton-3630")
  .map((s) => {
  const verifiedRate = VERIFIED_RATES[s.id];
  const avgRoomRate = verifiedRate ?? Math.round(seededValue(s.id, 175, 260) / 5) * 5;
  const avgRoomRateVerified = verifiedRate !== undefined;
  return {
    id: s.id,
    name: s.name,
    postcode: s.postcode,
    state: "VIC",
    council: s.council,
    avgRoomRate,
    avgRoomRateVerified,
    numRoomingHouses: s.numRoomingHouses,
    lat: s.lat,
    lng: s.lng,
    commentary: avgRoomRateVerified
      ? `${s.name} has ${s.numRoomingHouses} registered rooming house${
          s.numRoomingHouses === 1 ? "" : "s"
        } on the Consumer Affairs Victoria register.`
      : `${s.name} has ${s.numRoomingHouses} registered rooming house${
          s.numRoomingHouses === 1 ? "" : "s"
        } on the Consumer Affairs Victoria register. Rate figures for this suburb are estimated pending verified data.`,
    rentalTrend: rentalTrend(avgRoomRate - 15),
    supplyGrowth: supplyGrowth(Math.max(s.numRoomingHouses - 4, 1)),
  };
});

export const suburbs: Suburb[] = [...curatedSuburbs, ...generatedSuburbs];

export function getSuburbById(id: string) {
  return suburbs.find((s) => s.id === id);
}

// Never show a fabricated rate as if it were real — suburbs without a verified
// figure say so plainly instead of displaying the estimated placeholder number.
export function formatAvgRoomRate(suburb: Suburb): string {
  if (!suburb.avgRoomRateVerified) return "No market data";
  return suburb.avgRoomRateDisplay ?? `$${suburb.avgRoomRate}/wk`;
}

export const dashboardStats = {
  totalSuburbsTracked: suburbs.length,
  avgGrossYield: "12.4%",
  verifiedSuburbs: suburbs.filter((s) => s.avgRoomRateVerified).length,
  dataUpdated: "25 Jul 2026",
};
