'use client'
import React, { useState, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import {
    Loader2,
    AlertCircle,
    RefreshCw,
    Check,
    Zap,
    ArrowUpRight,
    CreditCard,
    Crown,
    ArrowDownRight,
    X,
} from 'lucide-react'
import { useBillingUsage, useBillingPlans, usePlanCheck } from '@/hooks/use-billing'
import { createCheckoutSession, cancelSubscription } from '@/lib/api'
import type { BillingPlan } from '@/lib/api'

// ─── Usage bar ────────────────────────────────────────────────────────────

function UsageBar({ label, used, limit, unit }: { label: string; used: number; limit?: number; unit?: string }) {
    const pct = limit ? Math.min((used / limit) * 100, 100) : 0
    const isHigh = pct >= 80
    const isMax = pct >= 100

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{label}</span>
                <span className={`text-xs font-mono ${isMax ? 'text-destructive' : isHigh ? 'text-amber-400' : 'text-muted-foreground'}`}>
                    {used.toLocaleString()}{limit != null ? ` / ${limit.toLocaleString()}` : ''}{unit ? ` ${unit}` : ''}
                </span>
            </div>
            {limit != null && (
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isMax ? 'bg-destructive' : isHigh ? 'bg-amber-400' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            )}
        </div>
    )
}

// ─── Plan card ────────────────────────────────────────────────────────────

const PLAN_DISPLAY: Record<string, { name: string; description: string; icon: React.ReactNode }> = {
    free_org: {
        name: 'Free',
        description: 'For individuals and small experiments',
        icon: <Zap size={18} className="text-muted-foreground" />,
    },
    pro: {
        name: 'Pro',
        description: 'For teams and production workloads',
        icon: <Crown size={18} className="text-primary" />,
    },
}

function limitLabel(key: string): string {
    const map: Record<string, string> = {
        maxProjects: 'Projects',
        maxMocksPerProject: 'Mocks per project',
        maxResponsesPerMock: 'Responses per mock',
        monthlyRequests: 'Monthly requests',
        requestLogsRetentionDays: 'Log retention',
    }
    return map[key] ?? key
}

function limitValue(key: string, value: number): string {
    if (key === 'requestLogsRetentionDays') return `${value} days`
    if (key === 'monthlyRequests') return value.toLocaleString()
    return String(value)
}

const LIMIT_KEYS = [
    'maxProjects',
    'maxMocksPerProject',
    'maxResponsesPerMock',
    'monthlyRequests',
    'requestLogsRetentionDays',
] as const

function PlanCard({ plan, isCurrent, onSubscribe, subscribing }: {
    plan: BillingPlan
    isCurrent: boolean
    onSubscribe?: () => void
    subscribing?: boolean
}) {
    const display = PLAN_DISPLAY[plan.planKey] ?? {
        name: plan.planKey,
        description: '',
        icon: <Zap size={18} className="text-muted-foreground" />,
    }

    return (
        <div
            className={`relative flex flex-col bg-card border rounded-xl p-5 transition-all ${isCurrent ? 'border-primary shadow-md shadow-primary/5' : 'border-border'}`}
        >
            {isCurrent && (
                <span className="absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
                    Current plan
                </span>
            )}

            <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isCurrent ? 'bg-primary/15' : 'bg-muted'}`}>
                    {display.icon}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-foreground">{display.name}</h3>
                    <p className="text-xs text-muted-foreground">{display.description}</p>
                </div>
            </div>

            <ul className="flex flex-col gap-2 flex-1 mb-5">
                {LIMIT_KEYS.map((key) => (
                    <li key={key} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{limitLabel(key)}</span>
                        <span className="font-medium text-foreground font-mono">
                            {limitValue(key, plan[key as keyof BillingPlan] as number)}
                        </span>
                    </li>
                ))}
            </ul>

            {!isCurrent && plan.planKey !== 'free_org' && onSubscribe && (
                <button
                    onClick={onSubscribe}
                    disabled={subscribing}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {subscribing ? (
                        <><Loader2 size={14} className="animate-spin" /> Redirecting…</>
                    ) : (
                        <>Upgrade to Pro <ArrowUpRight size={12} /></>
                    )}
                </button>
            )}

            {isCurrent && (
                <div className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg">
                    <Check size={14} /> Active
                </div>
            )}
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────

const BillingPage = () => {
    const { getToken } = useAuth()
    const { user } = useUser()
    const { usage, loading: usageLoading, error: usageError, refetch: refetchUsage } = useBillingUsage()
    const { plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = useBillingPlans()
    const { isPro, planKey } = usePlanCheck()
    const [subscribing, setSubscribing] = useState(false)
    const [subscribeError, setSubscribeError] = useState<string | null>(null)

    const loading = usageLoading || plansLoading
    const error = usageError || plansError

    const handleSubscribe = async () => {
        try {
            setSubscribing(true)
            setSubscribeError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')

            const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress
            if (!email) throw new Error('No email found')

            const { checkout_url } = await createCheckoutSession(token, {
                email,
                name: user?.fullName || undefined,
                returnUrl: window.location.origin + '/billing',
            })

            // Redirect to Dodo Payments hosted checkout
            window.location.href = checkout_url
        } catch (err: any) {
            setSubscribeError(err?.message || 'Failed to create checkout session')
            setSubscribing(false)
        }
    }

    if (loading) {
        return (
            <div className="flex-1 h-screen bg-background flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading billing info…</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex-1 h-screen bg-background flex flex-col items-center justify-center gap-3">
                <AlertCircle size={22} className="text-destructive" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                    onClick={() => { refetchUsage(); refetchPlans() }}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer"
                >
                    <RefreshCw size={12} /> Retry
                </button>
            </div>
        )
    }

    return (
        <div className="flex-1 h-screen bg-background overflow-auto">
            <div className="max-w-4xl mx-auto p-8 flex flex-col gap-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <CreditCard size={22} className="text-primary" />
                        Billing & Usage
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your plan and monitor resource usage.
                    </p>
                </div>

                {/* Usage */}
                {usage && (
                    <section className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold text-foreground">Current Usage</h2>
                            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {usage.plan}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <UsageBar
                                label="Projects"
                                used={usage.usage.projects.used}
                                limit={usage.usage.projects.limit}
                            />
                            <UsageBar
                                label="Monthly Requests"
                                used={usage.usage.monthlyRequests.used}
                                limit={usage.usage.monthlyRequests.limit}
                            />
                            <UsageBar
                                label="Total Mocks"
                                used={usage.usage.totalMocks.used}
                                limit={usage.usage.totalMocks.limit}
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
                            <Stat label="Max projects" value={usage.limits.maxProjects} />
                            <Stat label="Mocks / project" value={usage.limits.maxMocksPerProject} />
                            <Stat label="Responses / mock" value={usage.limits.maxResponsesPerMock} />
                            <Stat label="Log retention" value={`${usage.limits.requestLogsRetentionDays}d`} />
                        </div>
                    </section>
                )}

                {/* Checkout error */}
                {subscribeError && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                        <AlertCircle size={16} /> {subscribeError}
                    </div>
                )}

                {/* Plans */}
                {plans.length > 0 && (
                    <section>
                        <h2 className="text-base font-semibold text-foreground mb-4">Available Plans</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {plans.map((plan) => (
                                <PlanCard
                                    key={plan.planKey}
                                    plan={plan}
                                    isCurrent={plan.planKey === (usage?.plan ?? planKey)}
                                    onSubscribe={handleSubscribe}
                                    subscribing={subscribing}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Manage subscription (for pro users) */}
                {isPro && (
                    <ManageSubscription
                        onCancelled={() => { refetchUsage(); refetchPlans() }}
                    />
                )}
            </div>
        </div>
    )
}

function ManageSubscription({
    onCancelled,
}: {
    onCancelled: () => void
}) {
    const { getToken } = useAuth()
    const [showConfirm, setShowConfirm] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const [cancelError, setCancelError] = useState<string | null>(null)

    const handleCancelSubscription = useCallback(async () => {
        setCancelling(true)
        setCancelError(null)

        try {
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')

            await cancelSubscription(token)
            setShowConfirm(false)
            onCancelled()
        } catch (err: any) {
            setCancelError(err?.message || 'Failed to cancel subscription. Please try again.')
        } finally {
            setCancelling(false)
        }
    }, [getToken, onCancelled])

    return (
        <section className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-base font-semibold text-foreground mb-2">Manage Subscription</h2>
            <p className="text-sm text-muted-foreground mb-4">
                You&apos;re on the <span className="font-semibold text-primary">Pro</span> plan.
                Manage your subscription below.
            </p>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => { setShowConfirm(true); setCancelError(null) }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-destructive/30 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                    <ArrowDownRight size={14} /> Downgrade to Free
                </button>
            </div>

            {showConfirm && (
                <div className="mt-4 border border-destructive/30 rounded-lg p-4 bg-destructive/5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-destructive mb-1">Cancel Pro Subscription?</h3>
                            <p className="text-sm text-muted-foreground mb-1">
                                You&apos;ll lose access to Pro features at the end of your current billing period:
                            </p>
                            <ul className="text-sm text-muted-foreground list-disc ml-4 mb-3 space-y-0.5">
                                <li>Project limit drops from 50 to 3</li>
                                <li>Mocks per project drops from 100 to 5</li>
                                <li>Responses per mock drops from 20 to 3</li>
                                <li>Monthly requests drop from 100k to 1k</li>
                                <li>Log retention drops from 30 to 7 days</li>
                            </ul>

                            {cancelError && (
                                <p className="text-sm text-destructive mb-3 flex items-center gap-1.5">
                                    <AlertCircle size={14} /> {cancelError}
                                </p>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={cancelling}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelling ? (
                                        <><Loader2 size={14} className="animate-spin" /> Cancelling…</>
                                    ) : (
                                        'Yes, cancel subscription'
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    disabled={cancelling}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Keep Pro
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}

function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold text-foreground font-mono">{String(value)}</span>
        </div>
    )
}

export default BillingPage
