// Equipment types grouped by category
export const EQUIPMENT_CATEGORIES = [
  {
    label: 'Construction Equipment',
    items: [
      { value: 'skid_steers', label: 'Skid Steers' },
      { value: 'excavators', label: 'Excavators' },
      { value: 'mini_excavators', label: 'Mini Excavators' },
      { value: 'compact_track_loaders', label: 'Compact Track Loaders' },
      { value: 'wheel_loaders', label: 'Wheel Loaders' },
      { value: 'backhoes', label: 'Backhoes' },
      { value: 'bulldozers', label: 'Bulldozers' },
      { value: 'telehandlers', label: 'Telehandlers' },
      { value: 'aerial_lifts', label: 'Aerial Lifts' },
      { value: 'forklifts', label: 'Forklifts' },
      { value: 'dump_trucks', label: 'Dump Trucks' },
      { value: 'concrete_equipment', label: 'Concrete Equipment' },
    ],
  },
  {
    label: 'Commercial Trucks',
    items: [
      { value: 'semi_trucks', label: 'Semi Trucks & Trailers' },
      { value: 'flatbed_trucks', label: 'Flatbed Trucks' },
      { value: 'box_trucks', label: 'Box Trucks' },
      { value: 'refrigerated_trucks', label: 'Refrigerated Trucks' },
      { value: 'cargo_vans', label: 'Cargo Vans' },
    ],
  },
  {
    label: 'Specialty Trucks',
    items: [
      { value: 'concrete_mixer_trucks', label: 'Concrete Mixer Trucks' },
      { value: 'lowboy_trucks', label: 'Lowboy / Transport Trucks' },
      { value: 'water_trucks', label: 'Water Trucks' },
      { value: 'asphalt_trucks', label: 'Asphalt / Paving Trucks' },
      { value: 'tow_trucks', label: 'Tow Trucks' },
      { value: 'vacuum_trucks', label: 'Vacuum Trucks' },
    ],
  },
  {
    label: 'Service Vehicles',
    items: [
      { value: 'service_body_trucks', label: 'Service Body Trucks' },
      { value: 'utility_bucket_trucks', label: 'Utility Bucket Trucks' },
      { value: 'plumbing_vans', label: 'Plumbing Service Vans' },
      { value: 'electrical_vans', label: 'Electrical Service Vans' },
      { value: 'hvac_vehicles', label: 'HVAC Service Vehicles' },
      { value: 'landscaping_trucks', label: 'Landscaping Trucks' },
    ],
  },
  {
    label: 'Municipal & Emergency',
    items: [
      { value: 'street_sweepers', label: 'Street Sweepers' },
      { value: 'fire_engines', label: 'Fire Engines' },
      { value: 'ambulances', label: 'Ambulances' },
      { value: 'police_vehicles', label: 'Police Command Vehicles' },
      { value: 'snow_plows', label: 'Snow Plow Trucks' },
      { value: 'municipal_trucks', label: 'Municipal Maintenance Trucks' },
    ],
  },
  {
    label: 'Agricultural',
    items: [
      { value: 'grain_trucks', label: 'Grain Trucks' },
      { value: 'livestock_trucks', label: 'Livestock Trucks' },
      { value: 'spray_trucks', label: 'Agricultural Spray Trucks' },
    ],
  },
]

// Flat list for lookups (badge labels, etc.)
export const EQUIPMENT_TYPES = [
  { value: 'any', label: 'Any Equipment' },
  ...EQUIPMENT_CATEGORIES.flatMap((cat) => cat.items),
]

// US States including Puerto Rico
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
] as const

// Lead pipeline stages
export const LEAD_STATUSES = [
  { value: 'new_lead', label: 'New Lead', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'replied', label: 'Replied', color: 'bg-purple-100 text-purple-800' },
  { value: 'call_booked', label: 'Call Booked', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'activated', label: 'Activated', color: 'bg-green-100 text-green-800' },
  { value: 'dead', label: 'Dead / Not Fit', color: 'bg-gray-100 text-gray-800' },
] as const

// Cadence angles for A/B/C outreach testing
export const CADENCE_ANGLES = [
  {
    value: 'A' as const,
    label: 'Angle A: Close-Rate Lift',
    description: 'Your buyers want your equipment. They just can\'t pay cash. We fix that.',
    theme: 'bg-blue-50 border-blue-200',
  },
  {
    value: 'B' as const,
    label: 'Angle B: Speed / Friction',
    description: 'We get your customers funded in hours, not weeks. No chasing banks.',
    theme: 'bg-green-50 border-green-200',
  },
  {
    value: 'C' as const,
    label: 'Angle C: Stop Losing Deals',
    description: 'How many deals walked last month because financing fell through?',
    theme: 'bg-orange-50 border-orange-200',
  },
] as const

// Cadence step schedule: step number → days after enrollment
export const CADENCE_DAYS: Record<number, { day: number; label: string }> = {
  1: { day: 1, label: 'Day 1 — Intro' },
  2: { day: 3, label: 'Day 3 — Follow-up Question' },
  3: { day: 7, label: 'Day 7 — Pilot Offer' },
  4: { day: 14, label: 'Day 14 — Breakup' },
}

// Default weekly scoreboard targets
export const SCOREBOARD_DEFAULTS = {
  weekly_leads_found: 20,
  weekly_emails_sent: 30,
  weekly_replies: 5,
  weekly_calls_booked: 3,
  weekly_deals_activated: 1,
} as const

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    searchLimit: 3,
    leadLimit: 10,
    features: ['3 AI searches', '10 leads storage', 'Basic email templates'],
  },
  starter: {
    name: 'Starter',
    price: 29,
    searchLimit: 10,
    leadLimit: 50,
    features: [
      '10 AI searches per month',
      '50 leads storage',
      'Full access to AI Lead Finder',
      'Smart Search access (limited)',
      'Social listening access',
      'CSV export',
      '3 email templates',
    ],
  },
  pro: {
    name: 'Pro',
    price: 69,
    searchLimit: -1, // unlimited
    leadLimit: -1, // unlimited
    features: [
      'Unlimited AI searches',
      'Unlimited leads storage',
      'Smart Search (cross-referencing)',
      'All social listening platforms',
      'Batch verification',
      'Advanced analytics dashboard',
      'Priority support',
      'All email templates',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // custom
    searchLimit: -1,
    leadLimit: -1,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
  },
} as const

// Popular states for quick selection in Smart Search
export const POPULAR_STATES = ['TX', 'CA', 'FL', 'GA', 'NC', 'OH', 'PA', 'IL', 'AZ', 'CO'] as const
