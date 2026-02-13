const CRAIGSLIST_API_URL = 'https://craigslist-data.p.rapidapi.com/search'

// Map equipment types to Craigslist search terms
const EQUIPMENT_SEARCH_TERMS: Record<string, string> = {
  // Construction Equipment
  skid_steers: 'skid steer',
  excavators: 'excavator',
  mini_excavators: 'mini excavator',
  compact_track_loaders: 'compact track loader',
  wheel_loaders: 'wheel loader',
  backhoes: 'backhoe',
  bulldozers: 'bulldozer dozer',
  telehandlers: 'telehandler',
  aerial_lifts: 'aerial lift boom lift scissor lift',
  forklifts: 'forklift',
  dump_trucks: 'dump truck',
  concrete_equipment: 'concrete mixer pump',
  // Commercial Trucks
  semi_trucks: 'semi truck trailer',
  flatbed_trucks: 'flatbed truck',
  box_trucks: 'box truck',
  refrigerated_trucks: 'refrigerated truck reefer',
  cargo_vans: 'cargo van',
  // Specialty Trucks
  concrete_mixer_trucks: 'concrete mixer truck',
  lowboy_trucks: 'lowboy trailer',
  water_trucks: 'water truck',
  asphalt_trucks: 'asphalt paving truck',
  tow_trucks: 'tow truck wrecker',
  vacuum_trucks: 'vacuum truck',
  // Service Vehicles
  service_body_trucks: 'service body truck',
  utility_bucket_trucks: 'bucket truck utility',
  plumbing_vans: 'plumbing van',
  electrical_vans: 'electrical van',
  hvac_vehicles: 'HVAC van truck',
  landscaping_trucks: 'landscaping truck',
  // Municipal & Emergency
  street_sweepers: 'street sweeper',
  fire_engines: 'fire truck engine',
  ambulances: 'ambulance',
  police_vehicles: 'police vehicle',
  snow_plows: 'snow plow truck',
  municipal_trucks: 'municipal truck',
  // Agricultural
  grain_trucks: 'grain truck',
  livestock_trucks: 'livestock truck trailer',
  spray_trucks: 'spray truck agricultural',
}

// Map US state abbreviations to Craigslist city slugs
// Using major cities per state that Craigslist recognizes
const STATE_TO_CRAIGSLIST_CITY: Record<string, string> = {
  AL: 'birmingham',
  AK: 'anchorage',
  AZ: 'phoenix',
  AR: 'littlerock',
  CA: 'losangeles',
  CO: 'denver',
  CT: 'hartford',
  DE: 'delaware',
  FL: 'miami',
  GA: 'atlanta',
  HI: 'honolulu',
  ID: 'boise',
  IL: 'chicago',
  IN: 'indianapolis',
  IA: 'desmoines',
  KS: 'kansascity',
  KY: 'louisville',
  LA: 'neworleans',
  ME: 'maine',
  MD: 'baltimore',
  MA: 'boston',
  MI: 'detroit',
  MN: 'minneapolis',
  MS: 'jackson',
  MO: 'stlouis',
  MT: 'montana',
  NE: 'omaha',
  NV: 'lasvegas',
  NH: 'nh',
  NJ: 'newjersey',
  NM: 'albuquerque',
  NY: 'newyork',
  NC: 'charlotte',
  ND: 'fargo',
  OH: 'columbus',
  OK: 'oklahomacity',
  OR: 'portland',
  PA: 'philadelphia',
  PR: 'puertorico',
  RI: 'providence',
  SC: 'charleston',
  SD: 'siouxfalls',
  TN: 'nashville',
  TX: 'houston',
  UT: 'saltlakecity',
  VT: 'vermont',
  VA: 'norfolk',
  WA: 'seattle',
  WV: 'charlestonwv',
  WI: 'milwaukee',
  WY: 'wyoming',
}

export interface CraigslistListing {
  title: string
  url: string
  price: string
  location: string
}

export interface CraigslistSearchResult {
  listings: CraigslistListing[]
  totalResults: number
  query: string
  region: string
}

export async function searchCraigslist(
  query: string,
  options?: {
    equipmentType?: string
    state?: string
    city?: string
    category?: string
  }
): Promise<CraigslistSearchResult> {
  const apiKey = process.env.RAPIDAPI_KEY

  if (!apiKey) {
    throw new Error('Missing RapidAPI key')
  }

  // Build search query
  const searchParts: string[] = []

  if (query) {
    searchParts.push(query)
  }

  if (options?.equipmentType && options.equipmentType !== 'any') {
    const term = EQUIPMENT_SEARCH_TERMS[options.equipmentType]
    if (term) {
      searchParts.push(term)
    }
  }

  const searchQuery = searchParts.join(' ') || 'heavy equipment'

  // Determine Craigslist region — prefer user-provided city over state default
  const region = options?.city
    ? options.city.toLowerCase().replace(/\s+/g, '')
    : options?.state
      ? STATE_TO_CRAIGSLIST_CITY[options.state] || 'newyork'
      : 'newyork'

  // Use heavy equipment category by default
  const category = options?.category || 'hva'

  const response = await fetch(CRAIGSLIST_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'craigslist-data.p.rapidapi.com',
      'x-rapidapi-key': apiKey,
    },
    body: JSON.stringify({
      query: searchQuery,
      gl: region,
      category: category,
    }),
  })

  if (!response.ok) {
    throw new Error(`Craigslist API error: ${response.status}`)
  }

  const data = await response.json()

  const listings: CraigslistListing[] = (data.data || []).map(
    (item: { title: string; url: string; price: string; location: string }) => ({
      title: item.title,
      url: item.url,
      price: item.price || 'N/A',
      location: item.location || '',
    })
  )

  return {
    listings,
    totalResults: data.meta?.results || listings.length,
    query: searchQuery,
    region,
  }
}
