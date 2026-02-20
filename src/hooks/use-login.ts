'use client'
import { useSignIn, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from 'react'
import { syncUser } from '@/lib/api'

export const useLoginUser = () => {

    const router = useRouter()
    const { signIn, setActive } = useSignIn()
    const { getToken } = useAuth()
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const loginUser = async ({ email, password }: { email: string, password: string }) => {

        if (!signIn) return

        try {
            setLoading(true)
            const signinAttempt = await signIn.create({
                identifier: email
            })

            if (signinAttempt?.status === 'needs_first_factor') {
                const result = await signIn.attemptFirstFactor({
                    strategy: "password",
                    password: password,
                })

                if (result.status === "complete" && result.createdSessionId) {
                    await setActive({ session: result.createdSessionId })

                    // Sync Clerk user into MockBird's DB (fire-and-forget)
                    try {
                        const token = await getToken()
                        if (token) await syncUser(token)
                    } catch (syncErr) {
                        console.warn('auth/me sync failed (non-blocking):', syncErr)
                    }

                    router.push('/dashboard')
                }
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message ?? 'Login failed')
            setLoading(false)
        }
    }


    const handleGoogleSignIn = async () => {
        if (!signIn) return

        try {
            setLoading(true)
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: `${window.location.origin}/sso-callback`,
                redirectUrlComplete: `${window.location.origin}/auth/signup/complete-setup`,
            })
        } catch (err: any) {
            setLoading(false)
            console.error('Error with Google login:', err)
            setError(err.errors?.[0]?.message ?? 'Google sign-in failed')
        }
    }


    return {
        loginUser,
        handleGoogleSignIn,
        error,
        loading
    }



}