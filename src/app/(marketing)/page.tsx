import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Search,
  Radar,
  Shield,
  Mail,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'AI Lead Finder',
    description: 'Generate vendor leads instantly with AI-powered search across equipment marketplaces.',
  },
  {
    icon: Radar,
    title: 'Smart Search',
    description: 'Cross-reference multiple platforms including Reddit, Craigslist, and more.',
  },
  {
    icon: Users,
    title: 'Social Listening',
    description: 'Monitor social channels for vendors actively looking to sell equipment.',
  },
  {
    icon: Shield,
    title: 'Lead Verification',
    description: 'Auto-verify business information to ensure quality leads.',
  },
  {
    icon: Mail,
    title: 'Email Outreach',
    description: 'Professional templates with merge fields for personalized outreach.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track your performance, conversion rates, and lead pipeline.',
  },
]

const steps = [
  {
    number: '1',
    title: 'Set Your Criteria',
    description: 'Choose your target location and equipment types. Focus on skid steers, excavators, or any construction equipment.',
  },
  {
    number: '2',
    title: 'AI Finds Leads',
    description: 'Our AI scans multiple sources including dealer networks, marketplaces, and social platforms.',
  },
  {
    number: '3',
    title: 'Verify & Connect',
    description: 'Get verified contact info and reach out with professional email templates.',
  },
]

const pricing = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for individual brokers',
    features: [
      '10 AI searches per month',
      '50 leads storage',
      'Full access to AI Lead Finder',
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
    description: 'For serious lead generation',
    features: [
      'Unlimited AI searches',
      'Unlimited leads storage',
      'Smart Search cross-referencing',
      'All social listening platforms',
      'Batch verification',
      'Advanced analytics',
      'Priority support',
      'All email templates',
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
              Find Equipment Vendors{' '}
              <span className="text-orange-500">Before Your Competition</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600">
              The only tool that combines AI-powered lead generation with real-time
              marketplace monitoring to find skid steer and excavator vendors ready
              for financing partnerships.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
                  Start Finding Leads
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/signup?trial=true">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Get 3 Free Leads
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              500+ brokers trust us to find their next vendor partner
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need to Find Vendors
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful tools designed specifically for equipment financing brokers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">
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
              Three simple steps to start connecting with equipment vendors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-orange-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the plan that fits your business. Start free, upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                    <span className="text-gray-500">{plan.period}</span>
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
              Ready to Find Your Next Vendor Partner?
            </h2>
            <p className="mt-4 text-lg text-orange-100">
              Join hundreds of equipment financing brokers who are already using
              VendorFinder to grow their business.
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
