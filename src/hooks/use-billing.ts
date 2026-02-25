'use client'
import { useAuth } from '@clerk/nextjs'
import { useState, useEffect, useCallback } from 'react'
import {
    getBillingUsage,
    getBillingPlans,
    type BillingUsage,
    type BillingPlan,
} from '@/lib/api'

export function useBillingUsage() {
    const { getToken } = useAuth()
    const [usage, setUsage] = useState<BillingUsage | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetch = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')
            const data = await getBillingUsage(token)
            setUsage(data)
        } catch (err: any) {
            setError(err.message ?? 'Failed to load usage')
        } finally {
            setLoading(false)
        }
    }, [getToken])

    useEffect(() => { fetch() }, [fetch])

    return { usage, loading, error, refetch: fetch }
}

export function useBillingPlans() {
    const { getToken } = useAuth()
    const [plans, setPlans] = useState<BillingPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetch = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')
            const data = await getBillingPlans(token)
            setPlans(data)
        } catch (err: any) {
            setError(err.message ?? 'Failed to load plans')
        } finally {
            setLoading(false)
        }
    }, [getToken])

    useEffect(() => { fetch() }, [fetch])

    return { plans, loading, error, refetch: fetch }
}

/**
 * Checks the current org/user plan using the backend /billing/usage endpoint.
 * Returns helpers to gate UI features.
 */
export function usePlanCheck() {
    const { usage } = useBillingUsage()

    const isPro = usage?.plan === 'pro'
    const planKey = isPro ? 'pro' : 'free_org'

    return { isPro, planKey }
}
