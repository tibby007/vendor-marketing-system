'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SUBSCRIPTION_TIERS } from '@/lib/constants'
import { useToast } from '@/hooks/use-toast'
import { Check, Loader2, CreditCard, Calendar, Zap } from 'lucide-react'

export default function BillingPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [currentTier, setCurrentTier] = useState('free')
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const { profile } = await response.json()
          if (profile) {
            setCurrentTier(profile.subscription_tier || 'free')
          }
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load subscription info.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [toast])

  const handleUpgrade = async (tier: string) => {
    setUpgradingTo(tier)

    // In a real implementation, this would redirect to Stripe Checkout
    // For now, we'll show a message
    toast({
      title: 'Stripe Integration Required',
      description: 'Stripe checkout will be configured here. Contact support to upgrade.',
    })

    setUpgradingTo(null)
  }

  const tierColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700',
    starter: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-orange-100 text-orange-700',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-gray-500">
          Manage your subscription and billing information.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription</CardDescription>
            </div>
            <Badge className={tierColors[currentTier]}>
              {SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS]?.name || 'Free'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Searches</p>
                <p className="font-semibold">
                  {SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS]?.searchLimit === -1
                    ? 'Unlimited'
                    : `${SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS]?.searchLimit}/month`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Price</p>
                <p className="font-semibold">
                  ${SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS]?.price || 0}/mo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Billing Cycle</p>
                <p className="font-semibold">Monthly</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(SUBSCRIPTION_TIERS)
            .filter(([key]) => key !== 'free')
            .map(([key, tier]) => {
              const isCurrentPlan = currentTier === key
              const isPopular = key === 'pro'

              return (
                <Card
                  key={key}
                  className={`relative ${
                    isPopular ? 'border-orange-500 border-2' : ''
                  } ${isCurrentPlan ? 'bg-gray-50' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-orange-500">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">
                        {tier.price === null ? 'Custom' : `$${tier.price}`}
                      </span>
                      {tier.price !== null && (
                        <span className="text-gray-500">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        isPopular && !isCurrentPlan
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : ''
                      }`}
                      variant={isCurrentPlan ? 'outline' : isPopular ? 'default' : 'outline'}
                      disabled={isCurrentPlan || upgradingTo === key}
                      onClick={() => handleUpgrade(key)}
                    >
                      {upgradingTo === key ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : key === 'enterprise' ? (
                        'Contact Sales'
                      ) : (
                        'Upgrade'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>

      {/* Billing History (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            No billing history available. Billing history will appear here after your first payment.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
