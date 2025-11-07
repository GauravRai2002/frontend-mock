'use state'
import { useSignUp, useUser, useOrganizationList } from "@clerk/nextjs"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
type STEP = 'CREDENTIALS' | 'ORGANIZATION_DATA' | 'VERIFICATION'

export const useSignupUser = () => {


    const { signUp, setActive } = useSignUp()
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()

    const { createOrganization, setActive:setActiveOrganization } = useOrganizationList()

    const signUpUser = async ({ email, password, firstName, lastName, organizationName, source, userName ,setStep = null }: { email: string, password: string, firstName: string, lastName: string, organizationName: string, source:string, userName:string ,setStep?: React.Dispatch<React.SetStateAction<STEP>> | null }): Promise<any> => {

        if (!signUp) return

        try {
            setLoading(true)
            const createResult:any = await signUp.create({
                emailAddress: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                username:userName,
                unsafeMetadata: {
                    organizationName: organizationName || undefined,
                    source:source
                },
            });

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            if (setStep) {
                setStep('VERIFICATION');
            }

            return createResult
        } catch (err:any) {
            console.error(err)
            setError(err.errors[0].message)
            if(setStep){
                setStep('CREDENTIALS')
            }
            setLoading(false)
        }
    }

    const verifyEmailCode = async ({verificationCode, orgName}:{verificationCode:string, orgName:string}) => {
        if (!signUp) return;

        console.log(verificationCode)

        
        try {
            setLoading(true)
            // Verify the email with the code
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            });


            if (completeSignUp.status === "complete") {
                // Set the active session
                if (completeSignUp.createdSessionId) {
                    await setActive({ session: completeSignUp.createdSessionId }).then(async()=>{
                        if(createOrganization){
                        const organization = await createOrganization({
                            name:orgName,
                            slug:orgName.toLowerCase().replace(/\s+/g, '-'),
                        })
                        setActiveOrganization({organization:organization.id})
                    }
                    });
                    router.push('/')

                } else {
                    console.error('No session ID found in completed signup');
                }
            } else {
                // Handle incomplete verification
                console.log('Signup not complete, status:', completeSignUp.status);
            }
        } catch (err: any) {
            console.error('Error verifying email:', err);
            const errorMessage = err.errors?.[0]?.message || err.message || 'Invalid verification code';
            console.error(errorMessage)
            setError(errorMessage)
            throw new Error(err)
            setLoading(false)
        } finally {
            //TODO
        }
    }





    const handleGoogleSignUp = async () => {
        if (!signUp) return;

        try {
            setLoading(true)
            await signUp.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/signup",
                redirectUrlComplete: "/auth/complete-setup",
                continueSignIn: true,
                continueSignUp: true
            });
        } catch (err: any) {
            console.error('Error with Google login:', err);
            setError(err.errors[0].message)
            setLoading(false)

        }
    };


    return {
        signUpUser,
        handleGoogleSignUp,
        verifyEmailCode,
        loading,
        error
    }



}