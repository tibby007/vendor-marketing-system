// Google Places API (New) - Text Search client
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText'

export interface PlacesVendor {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  zip_code: string
  equipment_types: string[]
  description: string
  source: 'ai_finder' | 'smart_search'
  relevance_score: number
  google_maps_url: string
}

interface PlaceResult {
  id: string
  displayName?: { text: string; languageCode: string }
  formattedAddress?: string
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  websiteUri?: string
  googleMapsUri?: string
  types?: string[]
  addressComponents?: Array<{
    longText: string
    shortText: string
    types: string[]
  }>
  editorialSummary?: { text: string }
  primaryTypeDisplayName?: { text: string }
}

// Map our equipment type values to search-friendly terms
const EQUIPMENT_SEARCH_TERMS: Record<string, string> = {
  skid_steers: 'skid steer',
  excavators: 'excavator',
  mini_excavators: 'mini excavator',
  compact_track_loaders: 'compact track loader',
  wheel_loaders: 'wheel loader',
  backhoes: 'backhoe',
  bulldozers: 'bulldozer',
  telehandlers: 'telehandler',
  aerial_lifts: 'aerial lift boom lift scissor lift',
  forklifts: 'forklift',
  dump_trucks: 'dump truck',
  concrete_equipment: 'concrete equipment',
}

// Map state abbreviations to full names for better search results
const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', PR: 'Puerto Rico', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

function extractAddressComponent(
  components: PlaceResult['addressComponents'],
  type: string
): string {
  if (!components) return ''
  const comp = components.find((c) => c.types.includes(type))
  return comp?.longText || comp?.shortText || ''
}

function extractStateAbbreviation(
  components: PlaceResult['addressComponents']
): string {
  if (!components) return ''
  const comp = components.find((c) =>
    c.types.includes('administrative_area_level_1')
  )
  return comp?.shortText || ''
}

export async function searchPlaces(
  stateCode: string,
  equipmentType: string,
  maxResults: number = 10
): Promise<PlacesVendor[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not configured')
  }

  const stateName = STATE_NAMES[stateCode] || stateCode
  const equipmentTerm =
    equipmentType && equipmentType !== 'any'
      ? EQUIPMENT_SEARCH_TERMS[equipmentType] || equipmentType.replace(/_/g, ' ')
      : 'heavy equipment'

  const textQuery = `${equipmentTerm} dealer in ${stateName}`

  const response = await fetch(PLACES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.nationalPhoneNumber',
        'places.internationalPhoneNumber',
        'places.websiteUri',
        'places.googleMapsUri',
        'places.types',
        'places.addressComponents',
        'places.editorialSummary',
        'places.primaryTypeDisplayName',
      ].join(','),
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: maxResults,
      languageCode: 'en',
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Google Places API error:', response.status, errorBody)
    throw new Error(`Google Places API error: ${response.status}`)
  }

  const data = await response.json()
  const places: PlaceResult[] = data.places || []

  return places.map((place, index) => {
    const city = extractAddressComponent(place.addressComponents, 'locality')
    const state = extractStateAbbreviation(place.addressComponents)
    const zipCode = extractAddressComponent(place.addressComponents, 'postal_code')

    // Build a description from available data
    const businessType = place.primaryTypeDisplayName?.text || 'Equipment dealer'
    const summary = place.editorialSummary?.text || ''
    const description = summary
      || `${businessType} located in ${city || stateName}. Found via Google Places search for ${equipmentTerm} dealers.`

    return {
      id: place.id || `places-${index}-${Date.now()}`,
      company_name: place.displayName?.text || 'Unknown Business',
      contact_name: '', // Google Places doesn't provide individual contacts
      email: '', // Google Places doesn't provide email
      phone: place.nationalPhoneNumber || place.internationalPhoneNumber || '',
      website: place.websiteUri || '',
      address: place.formattedAddress || '',
      city: city || '',
      state: state || stateCode,
      zip_code: zipCode || '',
      equipment_types: equipmentType && equipmentType !== 'any' ? [equipmentType] : [],
      description,
      source: 'ai_finder' as const,
      relevance_score: Math.max(95 - index * 3, 70), // Rank by Google's order
      google_maps_url: place.googleMapsUri || '',
    }
  })
}
