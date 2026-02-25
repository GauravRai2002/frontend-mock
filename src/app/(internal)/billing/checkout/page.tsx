'use client'
import React, { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { createCheckoutSession } from '@/lib/api'

function CheckoutPageInner() {
    const router = useRouter()
    const { getToken } = useAuth()
    const { user } = useUser()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function startCheckout() {
            try {
                const token = await getToken()
                if (!token || cancelled) return

                const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress
                if (!email) {
                    router.push('/billing')
                    return
                }

                const { checkout_url } = await createCheckoutSession(token, {
                    email,
                    name: user?.fullName || undefined,
                    returnUrl: window.location.origin + '/billing',
                })

                if (!cancelled) {
                    window.location.href = checkout_url
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || 'Failed to start checkout')
                }
            }
        }

        if (user) {
            startCheckout()
        }

        return () => { cancelled = true }
    }, [getToken, user, router])

    if (error) {
        return (
            <div className="flex-1 h-screen bg-background flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <p className="text-sm text-destructive">{error}</p>
                <button
                    onClick={() => router.push('/billing')}
                    className="text-xs text-primary hover:underline cursor-pointer"
                >
                    Back to Billing
                </button>
            </div>
        )
    }

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
