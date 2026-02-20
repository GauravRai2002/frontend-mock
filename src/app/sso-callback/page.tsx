'use client'
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

/**
 * Clerk's OAuth callback handler.
 * Clerk redirects here after the Google OAuth exchange completes.
 * This component finishes the Clerk session and then Clerk redirects to
 * the redirectUrlComplete we supplied (/auth/signup/complete-setup).
 */
export default function SSOCallbackPage() {
    return <AuthenticateWithRedirectCallback />
}
