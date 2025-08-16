import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export const useLoginUser = () => {

    const router = useRouter()
    const { signIn, setActive } = useSignIn()

    const loginUser = async ({ email, password }: { email: string, password: string }) => {

        if (!signIn) return

        console.log(email)

        try {
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
        } catch (err) {
            console.error(err)
        }
    }


    const handleGoogleSignIn = async () => {
        if (!signIn) return;

        try {
            const signInWithGoogle:any = await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/auth/signup",
                redirectUrlComplete: "/",
            });
            console.log(signInWithGoogle)
        } catch (err: any) {
            console.error('Error with Google login:', err);
            if (err.errors?.[0]?.code === 'form_identifier_not_found') {
            // Redirect to signup
            router.push('/auth/signup');
            } else {
            console.error('Error with Google login:', err);
            }
        }
    };


    return {
        loginUser,
        handleGoogleSignIn,
    }



}