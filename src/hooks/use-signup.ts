'use client'
import { useSignUp } from "@clerk/nextjs"
import { useAuth } from "@clerk/nextjs"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { syncUser } from '@/lib/api'

type STEP = 'CREDENTIALS' | 'ORGANIZATION_DATA' | 'VERIFICATION'

export const useSignupUser = () => {

    const { signUp, setActive } = useSignUp()
    const { getToken } = useAuth()
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()

    // Note: organization creation is handled automatically by Clerk
    // via the "Create first organization" setting in the Clerk dashboard.

    const signUpUser = async ({ email, password, firstName, lastName, organizationName, source, userName }: { email: string, password: string, firstName: string, lastName: string, organizationName: string, source: string, userName: string }): Promise<any> => {

        if (!signUp) return

        try {
            setLoading(true)
            const createResult: any = await signUp.create({
                emailAddress: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                username: userName,
                unsafeMetadata: {
                    organizationName: organizationName || undefined,
                    source: source
                },
            })

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
            return createResult
        } catch (err: any) {
            console.error(err)
            setError(err.errors?.[0]?.message || 'Something went wrong')
            setLoading(false)
        }
    }

    const verifyEmailCode = async ({ verificationCode, orgName }: { verificationCode: string, orgName: string }) => {
        if (!signUp) return

        try {
            setLoading(true)

            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            })

            if (completeSignUp.status === "complete" && completeSignUp.createdSessionId) {
                // Activate the session — Clerk will automatically create the first
                // organization via the "Create first organization" dashboard setting.
                await setActive({ session: completeSignUp.createdSessionId })

                // Sync user into MockBird's DB (fire-and-forget)
                try {
                    const token = await getToken()
                    if (token) await syncUser(token)
                } catch (syncErr) {
                    console.warn('auth/me sync failed (non-blocking):', syncErr)
                }

                router.push('/dashboard')

            } else {
                console.log('Signup not complete, status:', completeSignUp.status)
            }
        } catch (err: any) {
            console.error('Error verifying email:', err)
            const errorMessage = err.errors?.[0]?.message || err.message || 'Invalid verification code'
            setError(errorMessage)
            setLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        if (!signUp) return

        try {
            setLoading(true)
            await signUp.authenticateWithRedirect({
                strategy: 'oauth_google',
                // redirectUrl = Clerk's built-in SSO handler
                redirectUrl: `${window.location.origin}/sso-callback`,
                // redirectUrlComplete = where to land after a successful OAuth signup
                redirectUrlComplete: `${window.location.origin}/auth/signup/complete-setup`,
            })
        } catch (err: any) {
            console.error('Error with Google signup:', err)
            setError(err.errors?.[0]?.message ?? 'Google sign-up failed')
            setLoading(false)
        }
    }

    /**
     * Called when Clerk redirects back to /auth/signup#/continue after Google OAuth.
     * This happens when username is required but Google didn't provide one.
     * Provide a username and Clerk will complete the sign-up.
     */
    const oauthContinue = async (username: string) => {
        if (!signUp) return
        try {
            setLoading(true)
            setError('')
            const updatedSignUp = await signUp.update({ username })
            if (updatedSignUp.status === 'complete' && updatedSignUp.createdSessionId) {
                await setActive({ session: updatedSignUp.createdSessionId })
                try {
                    const token = await getToken()
                    if (token) await syncUser(token)
                } catch { /* non-blocking */ }
                router.push('/dashboard')
            } else {
                setError('Could not complete sign-up. Please try again.')
                setLoading(false)
            }
        } catch (err: any) {
            console.error('OAuth continue error:', err)
            setError(err.errors?.[0]?.message ?? 'Failed to complete sign-up')
            setLoading(false)
        }
    }

    return {
        signUpUser,
        handleGoogleSignUp,
        verifyEmailCode,
        oauthContinue,
        signUpStatus: signUp?.status ?? null,
        loading,
        error
    }
}