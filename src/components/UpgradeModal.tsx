'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Zap, X, ArrowRight } from 'lucide-react'
import type { PlanLimitError, QuotaExceededError } from '@/lib/api'

interface UpgradeModalProps {
    onClose: () => void
    error?: PlanLimitError | QuotaExceededError | null
    title?: string
    description?: string
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, error, title, description }) => {
    const router = useRouter()

    const resolvedTitle = title
        ?? (error?.error === 'MONTHLY_QUOTA_EXCEEDED' ? 'Monthly Quota Exceeded' : 'Plan Limit Reached')

    const resolvedDescription = description
        ?? error?.message
        ?? 'You\'ve reached the limit of your current plan.'

    const isPlanLimit = error?.error === 'PLAN_LIMIT_REACHED'
    const limitDetail = isPlanLimit
        ? `${(error as PlanLimitError).current} / ${(error as PlanLimitError).limit} used on the ${(error as PlanLimitError).plan} plan`
        : undefined

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 pt-6 pb-5">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Zap size={18} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">{resolvedTitle}</h2>
                            {limitDetail && (
                                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{limitDetail}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 flex flex-col gap-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {resolvedDescription}
                    </p>

                    <div className="bg-muted/50 border border-border rounded-lg p-4">
                        <p className="text-xs font-semibold text-foreground mb-2.5">Pro plan includes:</p>
                        <ul className="flex flex-col gap-1.5">
                            {[
                                'Up to 50 projects',
                                '100 mocks per project',
                                '20 responses per mock',
                                '100,000 monthly requests',
                                '30-day request log retention',
                            ].map((f) => (
                                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                            Maybe later
                        </button>
                        <button
                            onClick={() => { onClose(); router.push('/billing') }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                            View Plans <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpgradeModal
