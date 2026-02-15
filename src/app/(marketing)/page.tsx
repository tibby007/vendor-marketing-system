import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Search,
  Radar,
  Mail,
  BarChart3,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Target,
  CalendarClock,
  MapPin,
} from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'AI Dealer Finder',
    description:
      'Search real equipment dealers by equipment type, state, and city. Powered by Google Places with 40+ equipment categories.',
  },
  {
    icon: Radar,
    title: 'Smart Search',
    description:
      'Cross-reference multiple data sources to find dealers your competitors haven\'t reached yet.',
  },
  {
    icon: Mail,
    title: 'Auto-Contact Enrichment',
    description:
      'Automatically scrape dealer websites for owner names, direct emails, and contact forms. No manual research needed.',
  },
  {
    icon: DollarSign,
    title: 'Financing Detection',
    description:
      'Instantly see which dealers already offer financing and which ones don\'t — so you know exactly where you fill a gap.',
  },
  {
    icon: CalendarClock,
    title: '4-Touch Cadence System',
    description:
      'Automated outreach sequences with 3 proven angles: Close-Rate Lift, Speed/Friction, and Stop Losing Deals.',
  },
  {
    icon: Target,
    title: '6-Stage Pipeline',
    description:
      'Track every dealer from New Lead through Contacted, Replied, Call Booked, to Activated — with stale lead alerts.',
  },
  {
    icon: BarChart3,
    title: 'Weekly Scoreboard',
    description:
      'Track your leads found, emails sent, replies, calls booked, and deals activated against personal weekly targets.',
  },
  {
    icon: MapPin,
    title: 'City-Level Targeting',
    description:
      'Search any city in all 50 states plus Puerto Rico. Target specific markets or go state-wide.',
  },
]

const steps = [
  {
    number: '1',
    title: 'Search by Equipment & Location',
    description:
      'Pick from 40+ equipment types — skid steers, excavators, semi trucks, forklifts, and more. Choose your state and city.',
  },
  {
    number: '2',
    title: 'Get Enriched Dealer Profiles',
    description:
      'AI finds real dealers via Google Places, then scrapes their websites for owner names, emails, and financing status.',
  },
  {
    number: '3',
    title: 'Save & Start Outreach',
    description:
      'Save leads to your pipeline, pick an outreach angle, and launch a 4-touch email cadence — Day 1, 3, 7, and 14.',
  },
  {
    number: '4',
    title: 'Track & Close',
    description:
      'Move dealers through your pipeline as they respond. Track your weekly performance on the scoreboard.',
  },
]

const pricing = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Try it out',
    features: [
      '3 AI searches',
      '10 leads storage',
      'Basic email templates',
      '6-stage pipeline',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For individual brokers',
    features: [
      '10 AI searches per month',
      '50 leads storage',
      'AI Dealer Finder with enrichment',
      'Smart Search (limited)',
      'Contact scraping (emails & names)',
      'Financing detection',
      'CSV export',
      '3 email templates',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$69',
    period: '/month',
    description: 'The full outreach machine',
    features: [
      'Unlimited AI searches',
      'Unlimited leads storage',
      'Smart Search cross-referencing',
      'Full contact enrichment',
      'Financing detection on all dealers',
      '4-touch cadence system (3 angles)',
      '12 vendor-first email templates',
      'Weekly performance scoreboard',
      'A/B/C angle testing',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-orange-50 to-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              Find Equipment Dealers.{' '}
              <span className="text-orange-500">Close Financing Partnerships.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600">
              The all-in-one platform for equipment financing brokers. Search real dealers
              by equipment type and location, get owner emails automatically, and run
              proven outreach cadences that book calls.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
                  Start Finding Dealers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/signup?trial=true">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Try 3 Free Searches
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              40+ equipment types across all 50 states. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything a Broker Needs to Build a Dealer Pipeline
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From finding dealers to closing partnerships — one platform, zero friction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Four steps from search to signed partnership.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-orange-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cadence Angles Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              3 Proven Outreach Angles
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Each angle comes with 4 ready-to-send emails. Pick the one that fits the dealer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="text-sm font-semibold text-blue-600 mb-1">Angle A</div>
                <CardTitle className="text-lg">Close-Rate Lift</CardTitle>
                <CardDescription className="text-blue-800">
                  &ldquo;Your buyers want your equipment. They just can&apos;t pay cash. We fix that.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700">
                  Best for dealers who sell well but lose deals at the financing stage.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="text-sm font-semibold text-green-600 mb-1">Angle B</div>
                <CardTitle className="text-lg">Speed / Friction</CardTitle>
                <CardDescription className="text-green-800">
                  &ldquo;We get your customers funded in hours, not weeks. No chasing banks.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  Best for dealers frustrated with slow bank approvals and lost momentum.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="text-sm font-semibold text-orange-600 mb-1">Angle C</div>
                <CardTitle className="text-lg">Stop Losing Deals</CardTitle>
                <CardDescription className="text-orange-800">
                  &ldquo;How many deals walked last month because financing fell through?&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  Best for dealers losing customers to competitors who have financing lined up.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free. Upgrade when you&apos;re ready to run cadences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricing.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.highlighted
                    ? 'border-orange-500 border-2 shadow-xl scale-105'
                    : 'border shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-500">{plan.period}</span>
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : ''
                      }`}
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold">
              Stop Cold-Calling. Start Closing.
            </h2>
            <p className="mt-4 text-lg text-orange-100">
              Find real equipment dealers, get their contact info automatically, and
              run outreach cadences that actually get replies.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
