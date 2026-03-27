'use client'

import { formatCurrency } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tag, Star } from 'lucide-react'
import { PricingTierData, TIER_NEXT_THRESHOLD, tierBadgeColors } from './analytics-types'

interface PricingTierCardProps {
  pricingTier: PricingTierData
}

export function PricingTierCard({ pricingTier }: PricingTierCardProps) {
  return (
    <Card className={`border-sand ${pricingTier.tier === 'VIP' ? 'bg-gold-wash border-gold/30' : 'bg-cream'}`}>
      <CardHeader className="border-b border-sand/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Tag className="h-4 w-4 text-sand" />
            <CardTitle className="font-serif text-lg text-ink">Your Pricing Tier</CardTitle>
            <Badge className={`text-xs font-semibold ${tierBadgeColors[pricingTier.tier]}`}>
              {pricingTier.tier}{pricingTier.tier === 'VIP' && ' ★'}
            </Badge>
          </div>
          {pricingTier.tier === 'VIP' && (
            <div className="flex items-center gap-1 text-gold text-xs font-medium">
              <Star className="h-3.5 w-3.5 fill-gold" />
              White-Glove Service
            </div>
          )}
        </div>
        <CardDescription className="text-ink/50">
          {pricingTier.tier === 'NEW' && 'Welcome! Reach $5,000 in lifetime spend to unlock Repeat Partner pricing.'}
          {pricingTier.tier === 'REPEAT' && 'Repeat Partner — reach $50,000 in lifetime spend to unlock VIP pricing.'}
          {pricingTier.tier === 'VIP' && 'VIP Partner — you have access to our best pricing across all categories.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {pricingTier.discounts.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-3">Your Discounts</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {pricingTier.discounts.map((d) => (
                <div key={d.category} className={`flex items-center justify-between px-3 py-2 border ${pricingTier.tier === 'VIP' ? 'border-gold/30 bg-gold-light/50' : 'border-sand/40'}`}>
                  <span className="text-sm text-ink/70 truncate">{d.category}</span>
                  <span className={`font-mono font-bold text-sm ml-2 shrink-0 ${pricingTier.tier === 'VIP' ? 'text-gold' : 'text-ink'}`}>
                    -{d.discountPct.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink/40 italic">No category discounts configured for your tier yet.</p>
        )}
        {pricingTier.nextTier && pricingTier.spendToNextTier !== null && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wider">Progress to {pricingTier.nextTier}{pricingTier.nextTier === 'VIP' && ' ★'}</p>
              <p className="text-xs text-ink/50">{formatCurrency(pricingTier.lifetimeSpend)} / {formatCurrency(TIER_NEXT_THRESHOLD[pricingTier.tier] ?? 0)}</p>
            </div>
            <div className="h-2 bg-shell overflow-hidden">
              <div className={`h-full transition-all ${pricingTier.tier === 'NEW' ? 'bg-sky' : 'bg-gold'}`} style={{ width: `${Math.min(100, (pricingTier.lifetimeSpend / (TIER_NEXT_THRESHOLD[pricingTier.tier] ?? 1)) * 100)}%` }} />
            </div>
            <p className="text-xs text-ink/40 mt-1.5">{formatCurrency(pricingTier.spendToNextTier)} more to unlock <span className="font-medium text-ink/60">{pricingTier.nextTier}</span> tier pricing</p>
          </div>
        )}
        {pricingTier.tier === 'VIP' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gold-light border border-gold/30">
            <Star className="h-4 w-4 text-gold fill-gold shrink-0" />
            <p className="text-sm text-gold">You are a VIP Partner — our highest tier. Thank you for your continued partnership.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
