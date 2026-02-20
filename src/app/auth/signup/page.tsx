'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useSignupUser } from '@/hooks/use-signup'


type STEP = 'CREDENTIALS' | 'ORGANIZATION_DATA' | 'VERIFICATION' | 'OAUTH_CONTINUE'

type FormDataSignUp = {
    email: string,
    password: string,
    confirmPassword: string,
    firstName: string,
    lastName: string,
    organizationName: string,
    source: string,
    userName: string,
}




const Page: React.FC = () => {

    const { signUpUser, verifyEmailCode, handleGoogleSignUp, oauthContinue, signUpStatus, error: loginError, loading } = useSignupUser()
    const [error, setError] = useState<string>('')
    const router = useRouter()
    const [step, setStep] = useState<STEP>('CREDENTIALS')
    const [formData, setFormData] = useState<FormDataSignUp>({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        organizationName: '',
        source: '',
        userName: ''
    })

    const [oauthUsername, setOauthUsername] = useState('')

    useEffect(() => {
        setError(loginError)
    }, [loginError])

    // Detect when Clerk redirects back with #/continue (OAuth with missing username)
    useEffect(() => {
        const isOAuthContinue =
            window.location.hash === '#/continue' ||
            signUpStatus === 'missing_requirements'
        if (isOAuthContinue) {
            setStep('OAUTH_CONTINUE')
        }
    }, [signUpStatus])

    const nextDisabled = () => {
        if (step === 'CREDENTIALS') {
            return (!formData.email || !formData.password || !formData.confirmPassword || formData.email.trim().length == 0 || formData.password.trim().length == 0 || formData.confirmPassword.trim().length == 0)
        } else {
            return (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.organizationName || !formData.userName || formData.email.trim().length == 0 || formData.password.trim().length == 0 || formData.firstName.trim().length == 0 || formData.lastName.trim().length == 0 || formData.organizationName.trim().length == 0 || formData.userName.trim().length == 0)
        }
    }
    // const nextDisabled = (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.organizationName || !formData.userName || formData.email.trim().length==0 || formData.password.trim().length==0 || formData.firstName.trim().length==0 || formData.lastName.trim().length==0 || formData.organizationName.trim().length==0 || formData.userName.trim().length==0)

    const handleFirstStepChange = (e: any) => {
        // e.preventDefault();
        setStep('ORGANIZATION_DATA')
        setError('')
    }

    const handleSubmit = async (formdata: FormData) => {
        const email = formdata.get('email') as string
        const password = formdata.get('password') as string
        const organizationName = formdata.get('organizationName') as string
        const firstName = formdata.get('firstName') as string
        const lastName = formdata.get('lastName') as string
        const source = formdata.get('source') as string
        const userName = formdata.get('userName') as string

        if (!email || !password || !firstName || !lastName || !userName || !organizationName || email.trim().length == 0 || password.trim().length == 0 || firstName.trim().length == 0 || lastName.trim().length == 0 || organizationName.trim().length == 0 || userName.trim().length == 0) {
            setError('Please enter all the details')
            return
        }
        const result = await signUpUser({ email, password, firstName, lastName, organizationName, source, userName })
        if (result) setStep('VERIFICATION')
    }

    const handleVerification = async (_formData: FormData) => {
        const code = _formData.get('code') as string

        try {
            await verifyEmailCode({ verificationCode: code, orgName: formData.organizationName })
            // router.push('/')
        } catch (err) {
            console.error(err)
        }
    }


    return (
        <div className='w-[40%] h-fit max-w-[450px] py-6 min-w-[300px] min-h-[450px] p-4 bg-card rounded-md flex flex-col items-center justify-center gap-4 shadow-lg shadow-foreground'>
            {step !== 'VERIFICATION' && <div className='w-full flex flex-col items-center justify-center gap-4 text-accent-foreground px-10'>
                <div className='flex flex-col items-center justify-center text-accent-foreground'>
                    <div className='text-xl font-bold'>Sign Up to MockBird</div>
                    <p className='text-sm text-center'>Welcome! Please sign up to continue</p>
                </div>



                <button onClick={handleGoogleSignUp} className='bg-accent w-full rounded-md p-2 cursor-pointer text-primary'>
                    Sign in with google
                </button>

                <div className='flex items-center justify-center gap-2 w-full my-4'>
                    <div className='h-0.5 bg-accent-foreground w-[40%]'></div>
                    <div>OR</div>
                    <div className='h-0.5 bg-accent-foreground w-[40%]'></div>
                </div>


                {error.length > 0 && <div className='w-full h-auto px-4 py-2 bg-destructive-foreground border-1 border-destructive rounded-md text-destructive text-center'>
                    {error}
                </div>}

                <form className='flex flex-col items-center justify-center w-full gap-6 overflow-x-hidden relative' onChange={(e) => {
                    const _formData = e.currentTarget;
                    const formData = new FormData(_formData)

                    const email = formData.get('email') as string
                    const password = formData.get('password') as string
                    const confirmPassword = formData.get('confirmPassword') as string
                    const organizationName = formData.get('organizationName') as string
                    const firstName = formData.get('firstName') as string
                    const lastName = formData.get('lastName') as string
                    const source = formData.get('source') as string
                    const userName = formData.get('userName') as string

                    setFormData((prev: FormDataSignUp) => {
                        return {
                            ...prev,
                            email,
                            password,
                            confirmPassword,
                            firstName,
                            lastName,
                            organizationName,
                            source,
                            userName
                        }
                    })
                }} action={step === 'ORGANIZATION_DATA' ? handleSubmit : handleFirstStepChange}>

                    <div className={` top-0 left-0 flex items-center justify-center gap-2 flex-col w-full h-full ${step === 'CREDENTIALS' ? 'relative' : '-translate-x-full absolute'}`}>
                        <div className={`w-full  flex flex-col items-start justify-center gap-2`}>
                            <label className='text-lg' htmlFor="email">Email</label>
                            <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="email" name="email" id="email" />
                        </div>

                        <div className={`w-full  flex flex-col items-start justify-center gap-2`}>
                            <label className='text-lg' htmlFor="password">Password</label>
                            <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="password" name="password" id="password" />
                        </div>

                        <div className={`w-full  flex flex-col items-start justify-center gap-2`}>
                            <label className='text-lg' htmlFor="confirmPassword">Confirm Password</label>
                            <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="password" name="confirmPassword" id="confirmPassword" />
                        </div>
                    </div>
                    <div className={`top-0 left-full flex items-center justify-center gap-2 flex-col w-full h-full ${step !== 'CREDENTIALS' ? 'relative -translate-x-full' : ' absolute'}`}>
                        <div className={`w-full  flex flex-col items-start justify-center gap-2`}>
                            <label className='text-lg' htmlFor="firstName">First Name</label>
                            <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="text" name="firstName" id="firstName" />
                        </div>

                        <div className={`w-full  flex flex-col items-start justify-center gap-2`}>
                            <label className='text-lg' htmlFor="lastName">Last Name</label>
                            <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="text" name="lastName" id="lastName" />
                        </div>

                        <div className={`w-full  flex flex-col items-start justify-center gap-2`}>
                            <label className='text-lg' htmlFor="userName">Username</label>
                            <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="text" name="userName" id="userName" />
                        </div>

                        <div className={`w-full flex flex-col items-start justify-center gap-2`}>
                            <label className='text-lg' htmlFor="organizationName">Organization Name</label>
                            <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="text" name="organizationName" id="organizationName" />
                        </div>

                        <div className={`w-full flex flex-col items-start justify-center gap-2`}>
                            <label className='text-lg' htmlFor="source">Where did you hear about us</label>
                            <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="text" name="source" id="source" />
                        </div>
                    </div>

                    {step === 'ORGANIZATION_DATA' && <input disabled={nextDisabled()} className={`w-full flex items-center justify-center gap-2 ${nextDisabled() ? 'bg-secondary cursor-not-allowed' : 'bg-primary cursor-pointer'}  rounded-md p-2  text-background`} type="submit" value='SUBMIT' />}
                    {step === 'CREDENTIALS' && <button disabled={nextDisabled()} className={`w-full flex items-center justify-center gap-2 ${nextDisabled() ? 'bg-secondary cursor-not-allowed' : 'bg-primary cursor-pointer'}  rounded-md p-2  text-background`} type="button" onClick={handleFirstStepChange}>NEXT</button>}


                </form>
            </div>}
            {step === 'VERIFICATION' && <div className='w-full flex flex-col items-center justify-center gap-4 text-accent-foreground px-10'>
                <div className='flex flex-col items-center justify-center text-accent-foreground gap-2'>
                    <div className='text-xl font-bold text-center'>Email sent to {formData.email}</div>
                    <p className='text-sm text-center'>Please enter the verification code sent to the email</p>
                </div>

                <div className='h-0.5 bg-accent-foreground w-full my-4'></div>


                <form className='flex flex-col items-center justify-center w-full gap-6' action={handleVerification}>
                    <div className={`w-full  flex flex-col items-start justify-center gap-2`}>
                        <label className='text-lg' htmlFor="code">Code</label>
                        <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="text" name="code" id="code" />
                    </div>

                    <input disabled={nextDisabled()} className={`w-full flex items-center justify-center gap-2 ${nextDisabled() ? 'bg-secondary cursor-not-allowed' : 'bg-primary cursor-pointer'}  rounded-md p-2  text-background`} type="submit" value='SUBMIT' />


                </form>
            </div>}
            {step === 'CREDENTIALS' && <div className='text-primary'>already have an account? <span onClick={() => {
                router.push('/auth/login')
            }} className='text-foreground underline cursor-pointer'>Login</span></div>}

            {step === 'OAUTH_CONTINUE' && (
                <div className='w-full flex flex-col items-center justify-center gap-6 text-accent-foreground px-10'>
                    <div className='flex flex-col items-center justify-center gap-2 text-center'>
                        <div className='text-xl font-bold'>One last step</div>
                        <p className='text-sm text-muted-foreground'>
                            Pick a username to complete your MockBird account
                        </p>
                    </div>

                    {error.length > 0 && (
                        <div className='w-full px-4 py-2 bg-destructive-foreground border border-destructive rounded-md text-destructive text-center text-sm'>
                            {error}
                        </div>
                    )}

                    <div className='w-full flex flex-col gap-2'>
                        <label className='text-sm font-medium' htmlFor='oauth-username'>Username</label>
                        <input
                            id='oauth-username'
                            type='text'
                            value={oauthUsername}
                            onChange={e => setOauthUsername(e.target.value)}
                            placeholder='e.g. john_doe'
                            className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background'
                            onKeyDown={e => { if (e.key === 'Enter' && oauthUsername.trim()) oauthContinue(oauthUsername.trim()) }}
                        />
                    </div>

                    <button
                        disabled={!oauthUsername.trim() || loading}
                        onClick={() => oauthContinue(oauthUsername.trim())}
                        className={`w-full flex items-center justify-center gap-2 rounded-md p-2 text-background transition-colors
                            ${!oauthUsername.trim() || loading ? 'bg-secondary cursor-not-allowed' : 'bg-primary cursor-pointer hover:bg-primary/90'}`}
                    >
                        {loading ? <Loader2 size={16} className='animate-spin' /> : null}
                        {loading ? 'Completing…' : 'Continue to MockBird'}
                    </button>
                </div>
            )}
        </div>
    )
}

export default Page