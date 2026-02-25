'use client'
import React, { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

type PlanPeriod = 'month' | 'annual'

function CheckoutPageInner() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const clerk = useClerk()

    const period = (searchParams.get('period') as PlanPeriod) || 'month'
    const planId = process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_ID || ''

    useEffect(() => {
        if (!clerk.loaded) return

        const clerkAny = clerk as any
        if (typeof clerkAny.__internal_openCheckout === 'function') {
            clerkAny.__internal_openCheckout({
                planId: planId || undefined,
                planPeriod: period,
                subscriberType: 'org',
                for: 'organization',
                newSubscriptionRedirectUrl: '/billing',
                onClose: () => router.push('/billing'),
            })
        } else {
            router.push('/billing')
        }
    }, [clerk, period, planId, router])

    return (
        <div className="flex-1 h-screen bg-background flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Opening checkout…</span>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="flex-1 h-screen bg-background flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Loading…</span>
                </div>
            }
        >
            <CheckoutPageInner />
        </Suspense>
    )
}
