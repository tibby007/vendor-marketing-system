// Equipment types from PRD
export const EQUIPMENT_TYPES = [
  { value: 'any', label: 'Any Equipment' },
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
] as const

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

// Lead statuses
export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'follow_up', label: 'Follow Up', color: 'bg-orange-100 text-orange-800' },
  { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-800' },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-gray-100 text-gray-800' },
] as const

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
