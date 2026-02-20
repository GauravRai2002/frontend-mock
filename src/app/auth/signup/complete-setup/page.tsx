'use client'
import React, { useEffect, useState } from 'react'
import { useSignUp, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { syncUser } from '@/lib/api'

/**
 * This page is the OAuth redirect target for Google sign-up.
 * Clerk redirects here after the OAuth flow completes.
 * We finalize the session and sync the user into MockBird's DB.
 */
const CompleteSetupPage: React.FC = () => {
    const { signUp, setActive } = useSignUp()
    const { getToken } = useAuth()
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const finalize = async () => {
            if (!signUp) return

            // If no pending signup — user may already be signed in, just redirect
            if (!signUp.status || signUp.status === 'complete') {
                try {
                    const token = await getToken()
                    if (token) await syncUser(token)
                } catch { /* non-blocking */ }
                router.replace('/dashboard')
                return
            }

            if (signUp.status === 'missing_requirements') {
                // OAuth returned but Clerk needs to finalize
                try {
                    if (signUp.createdSessionId) {
                        await setActive({ session: signUp.createdSessionId })
                        try {
                            const token = await getToken()
                            if (token) await syncUser(token)
                        } catch { /* non-blocking */ }
                        router.replace('/dashboard')
                    } else {
                        setError('Could not complete sign-up. Please try again.')
                    }
                } catch (err: any) {
                    setError(err.errors?.[0]?.message ?? 'Sign-up failed')
                }
            }
        }

        finalize()
    }, [signUp, setActive, getToken, router])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-sm text-destructive">{error}</p>
                <button
                    onClick={() => router.replace('/auth/signup')}
                    className="text-xs text-primary hover:underline cursor-pointer"
                >
                    Back to sign up
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 size={20} className="animate-spin text-primary" />
            <p className="text-sm">Finishing setup…</p>
        </div>
    )
}

export default CompleteSetupPage