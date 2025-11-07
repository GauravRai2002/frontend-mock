'use client'
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from 'react'

export const useLoginUser = () => {

    const router = useRouter()
    const { signIn, setActive } = useSignIn()
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const loginUser = async ({ email, password }: { email: string, password: string }) => {

        if (!signIn) return

        try {
            setLoading(true)
            const signinAttempt = await signIn?.create({
                identifier: email
            })

            if (signinAttempt?.status === 'needs_first_factor') {
                const result = await signIn.attemptFirstFactor({
                    strategy: "password",
                    password: password,
                });

                
                if (result.status === "complete" && result.createdSessionId) {
                    await setActive({session: result.createdSessionId})
                    router.push('/');
                }
            }
        } catch (err:any) {
            setError(err.errors[0].message)
            setLoading(false)
        } 
    }


    const handleGoogleSignIn = async () => {
        if (!signIn) return;

        try {
            setLoading(true)
            const signInWithGoogle:any = await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/auth/signup",
                redirectUrlComplete: "/",
            });
            console.log(signInWithGoogle)
        } catch (err: any) {
            setLoading(false)
            console.error('Error with Google login:', err);
            if (err.errors?.[0]?.code === 'form_identifier_not_found') {
            // Redirect to signup
            router.push('/auth/signup');
            } else {
                console.error('Error with Google login:', err);
                setError(err.data.errors[0])
            }
        }
    };


    return {
        loginUser,
        handleGoogleSignIn,
        error,
        loading
    }



}