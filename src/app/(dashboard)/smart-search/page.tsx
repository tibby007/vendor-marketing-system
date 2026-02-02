'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Radar, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SmartSearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Smart Search</h1>
        <p className="text-gray-500">
          Cross-reference multiple platforms to find vendors.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-orange-500" />
              Multi-Platform Search
            </CardTitle>
            <Badge variant="secondary">Pro Feature</Badge>
          </div>
          <CardDescription>
            Search across Reddit, Craigslist, and other platforms simultaneously.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upgrade to Pro
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Smart Search is available on the Pro plan. Upgrade to search across
              Reddit, Craigslist, and other platforms simultaneously.
            </p>
            <Link href="/billing">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Preview of what's included */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reddit</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            Search r/heavyequipment, r/construction, and related subreddits.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Craigslist</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            Monitor heavy equipment listings across all US regions.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Marketplace Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            Get alerts when new listings match your criteria.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
