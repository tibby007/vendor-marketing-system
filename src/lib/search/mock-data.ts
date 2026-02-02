// Mock vendor data for AI Lead Finder
export interface MockVendor {
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
}

// Generate mock vendors based on search criteria
export function generateMockVendors(
  state: string,
  equipmentType: string
): MockVendor[] {
  const stateData: Record<string, { cities: string[]; areaCode: string }> = {
    TX: { cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'], areaCode: '512' },
    CA: { cities: ['Los Angeles', 'San Diego', 'San Francisco', 'Sacramento', 'Fresno'], areaCode: '213' },
    FL: { cities: ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Fort Lauderdale'], areaCode: '305' },
    GA: { cities: ['Atlanta', 'Savannah', 'Augusta', 'Columbus', 'Macon'], areaCode: '404' },
    NC: { cities: ['Charlotte', 'Raleigh', 'Durham', 'Greensboro', 'Winston-Salem'], areaCode: '704' },
    OH: { cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'], areaCode: '614' },
    PA: { cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'], areaCode: '215' },
    IL: { cities: ['Chicago', 'Aurora', 'Naperville', 'Rockford', 'Peoria'], areaCode: '312' },
    AZ: { cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale'], areaCode: '602' },
    CO: { cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Boulder'], areaCode: '303' },
    NY: { cities: ['New York', 'Buffalo', 'Rochester', 'Syracuse', 'Albany'], areaCode: '212' },
    WA: { cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'], areaCode: '206' },
  }

  const equipmentNames: Record<string, string[]> = {
    skid_steers: ['Skid Steer', 'Compact Loader', 'Skid Loader'],
    excavators: ['Excavator', 'Digger', 'Track Excavator'],
    mini_excavators: ['Mini Excavator', 'Compact Excavator', 'Mini Digger'],
    compact_track_loaders: ['Track Loader', 'Compact Track Loader', 'CTL'],
    wheel_loaders: ['Wheel Loader', 'Front Loader', 'Payloader'],
    backhoes: ['Backhoe', 'Backhoe Loader', 'Loader Backhoe'],
    bulldozers: ['Bulldozer', 'Dozer', 'Crawler Dozer'],
    telehandlers: ['Telehandler', 'Reach Forklift', 'Telescopic Handler'],
    aerial_lifts: ['Aerial Lift', 'Boom Lift', 'Scissor Lift'],
    forklifts: ['Forklift', 'Lift Truck', 'Fork Truck'],
    dump_trucks: ['Dump Truck', 'Tipper Truck', 'Articulated Dump'],
    concrete_equipment: ['Concrete Mixer', 'Concrete Pump', 'Batch Plant'],
  }

  const businessPrefixes = [
    'Premier', 'Elite', 'Pro', 'Quality', 'Reliable', 'First Choice',
    'Top Tier', 'Superior', 'Best Value', 'Trusted', 'Metro', 'Regional',
    'National', 'American', 'United', 'Liberty', 'Freedom', 'Heritage',
  ]

  const businessSuffixes = [
    'Equipment', 'Machinery', 'Heavy Equipment', 'Construction Supply',
    'Equipment Sales', 'Industrial Equipment', 'Equipment Rental',
    'Equipment Co.', 'Equipment LLC', 'Equipment Inc.',
  ]

  const firstNames = [
    'John', 'Mike', 'David', 'James', 'Robert', 'William', 'Richard',
    'Thomas', 'Chris', 'Brian', 'Steven', 'Kevin', 'Jason', 'Mark',
  ]

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore',
  ]

  const { cities, areaCode } = stateData[state] || stateData.TX
  const equipmentLabels = equipmentType !== 'any'
    ? equipmentNames[equipmentType] || ['Equipment']
    : ['Equipment', 'Machinery', 'Heavy Equipment']

  // Generate 5-10 vendors
  const count = Math.floor(Math.random() * 6) + 5
  const vendors: MockVendor[] = []

  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)]
    const prefix = businessPrefixes[Math.floor(Math.random() * businessPrefixes.length)]
    const suffix = businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)]
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const equipmentLabel = equipmentLabels[Math.floor(Math.random() * equipmentLabels.length)]

    // Generate random phone
    const phone = `(${areaCode}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`

    // Generate random equipment types
    const allTypes = Object.keys(equipmentNames)
    const numTypes = Math.floor(Math.random() * 3) + 1
    const types = equipmentType !== 'any'
      ? [equipmentType, ...allTypes.filter(t => t !== equipmentType).slice(0, numTypes - 1)]
      : allTypes.sort(() => Math.random() - 0.5).slice(0, numTypes)

    const companyName = `${prefix} ${equipmentLabel} ${suffix}`
    const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)

    vendors.push({
      id: `mock-${i}-${Date.now()}`,
      company_name: companyName,
      contact_name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}@${domain}.com`,
      phone,
      website: `https://www.${domain}.com`,
      address: `${Math.floor(Math.random() * 9000) + 1000} Industrial Blvd`,
      city,
      state,
      zip_code: `${Math.floor(Math.random() * 90000) + 10000}`,
      equipment_types: types,
      description: `Leading dealer of ${equipmentLabel.toLowerCase()} and construction equipment in the ${city} area. Serving contractors and businesses since ${Math.floor(Math.random() * 25) + 1995}.`,
      source: 'ai_finder',
      relevance_score: Math.floor(Math.random() * 30) + 70,
    })
  }

  // Sort by relevance score
  return vendors.sort((a, b) => b.relevance_score - a.relevance_score)
}
