'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
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
    const [localError, setLocalError] = useState<string>('')
    const router = useRouter()
    const [step, setStep] = useState<STEP>('CREDENTIALS')

    // To enable nice transitions we just use state
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
        setLocalError(loginError)
    }, [loginError])

    // Detect when Clerk redirects back with #/continue (OAuth with missing username)
    useEffect(() => {
        // Only trigger OAUTH_CONTINUE if they actually came from an OAuth flow
        // The '#' check is reliable since Clerk appends it.
        // If we just check `signUpStatus === 'missing_requirements'`, it breaks 
        // the normal email flow because email unverified also gives 'missing_requirements'.
        if (window.location.hash === '#/continue') {
            setStep('OAUTH_CONTINUE')
        }
    }, [signUpStatus])

    const nextDisabled = () => {
        if (step === 'CREDENTIALS') {
            return (!formData.email || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword)
        } else {
            return (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.organizationName || !formData.userName)
        }
    }

    const handleFirstStepChange = () => {
        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match')
            return
        }
        setStep('ORGANIZATION_DATA')
        setLocalError('')
    }

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();

        const { email, password, organizationName, firstName, lastName, source, userName } = formData

        if (!email || !password || !firstName || !lastName || !userName || !organizationName) {
            setLocalError('Please enter all the details')
            return
        }
        const result = await signUpUser({ email, password, firstName, lastName, organizationName, source, userName })
        if (result) setStep('VERIFICATION')
    }

    const handleVerification = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const code = formData.get('code') as string

        try {
            await verifyEmailCode({ verificationCode: code, orgName: formData.get('organizationName') as string || '' })
            // router.push('/')
        } catch (err) {
            console.error(err)
        }
    }

    const handleInputChange = (e: React.FormEvent<HTMLFormElement>) => {
        const _formData = e.currentTarget;
        const fm = new FormData(_formData);

        setFormData(prev => ({
            ...prev,
            email: (fm.get('email') as string) || prev.email,
            password: (fm.get('password') as string) || prev.password,
            confirmPassword: (fm.get('confirmPassword') as string) || prev.confirmPassword,
            firstName: (fm.get('firstName') as string) || prev.firstName,
            lastName: (fm.get('lastName') as string) || prev.lastName,
            organizationName: (fm.get('organizationName') as string) || prev.organizationName,
            source: (fm.get('source') as string) || prev.source,
            userName: (fm.get('userName') as string) || prev.userName,
        }))
    }

    return (
        <div className='w-full max-w-md p-8 bg-card rounded-2xl flex flex-col items-center border border-border/50 shadow-2xl relative overflow-hidden transition-all duration-300'>
            {/* Background subtle glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>

            <div className='w-full flex flex-col gap-6 relative z-10 animate-in fade-in zoom-in-[0.98] duration-300'>
                {/* Header */}
                <div className='flex flex-col items-center gap-2 text-center'>
                    <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
                        {step === 'VERIFICATION' ? 'Check your email' : step === 'OAUTH_CONTINUE' ? 'Finish Sign Up' : 'Create an Account'}
                    </h1>
                    <p className='text-muted-foreground text-sm'>
                        {step === 'VERIFICATION' ? `We sent a verification code to ${formData.email}` :
                            step === 'OAUTH_CONTINUE' ? 'Pick a username to complete your MockBird setup' :
                                step === 'ORGANIZATION_DATA' ? 'Tell us a bit about yourself' : 'Start mocking APIs in seconds'}
                    </p>
                </div>

                {/* Main Content Area */}
                {(step === 'CREDENTIALS' || step === 'ORGANIZATION_DATA') && (
                    <>
                        {step === 'CREDENTIALS' && (
                            <>
                                <button
                                    onClick={handleGoogleSignUp}
                                    disabled={loading}
                                    className='w-full flex justify-center items-center gap-2 rounded-lg p-3 cursor-pointer bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors border border-border/50'
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Sign up with Google
                                </button>

                                <div className='flex items-center w-full'>
                                    <div className='h-px bg-border flex-1'></div>
                                    <span className='px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest'>Or continue with email</span>
                                    <div className='h-px bg-border flex-1'></div>
                                </div>
                            </>
                        )}

                        {localError && (
                            <div className='w-full px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium text-center animate-in fade-in zoom-in-95 duration-200'>
                                {localError}
                            </div>
                        )}

                        <form className='flex flex-col w-full gap-5' onChange={handleInputChange} onSubmit={step === 'ORGANIZATION_DATA' ? handleSubmit : (e) => e.preventDefault()}>

                            {step === 'CREDENTIALS' && (
                                <div className='flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300'>
                                    <div className='flex flex-col gap-2'>
                                        <label className='text-sm font-medium text-foreground' htmlFor="email">Email address</label>
                                        <input className='w-full rounded-lg bg-background text-foreground p-3 text-sm border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground' type="email" name="email" id="email" placeholder="name@example.com" defaultValue={formData.email} />
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <label className='text-sm font-medium text-foreground' htmlFor="password">Password</label>
                                        <input className='w-full rounded-lg bg-background text-foreground p-3 text-sm border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground' type="password" name="password" id="password" placeholder="Create a password" defaultValue={formData.password} />
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <label className='text-sm font-medium text-foreground' htmlFor="confirmPassword">Confirm Password</label>
                                        <input className='w-full rounded-lg bg-background text-foreground p-3 text-sm border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground' type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm your password" defaultValue={formData.confirmPassword} />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleFirstStepChange}
                                        disabled={nextDisabled()}
                                        className={`mt-2 w-full flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-semibold transition-all duration-200 
                                            ${nextDisabled() ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(255,165,0,0.15)] hover:shadow-[0_0_20px_rgba(255,165,0,0.25)]'}`}
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}

                            {step === 'ORGANIZATION_DATA' && (
                                <div className='flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='flex flex-col gap-2'>
                                            <label className='text-sm font-medium text-foreground' htmlFor="firstName">First Name</label>
                                            <input className='w-full rounded-lg bg-background text-foreground p-3 text-sm border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground' type="text" name="firstName" id="firstName" placeholder="John" defaultValue={formData.firstName} />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <label className='text-sm font-medium text-foreground' htmlFor="lastName">Last Name</label>
                                            <input className='w-full rounded-lg bg-background text-foreground p-3 text-sm border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground' type="text" name="lastName" id="lastName" placeholder="Doe" defaultValue={formData.lastName} />
                                        </div>
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <label className='text-sm font-medium text-foreground' htmlFor="userName">Username</label>
                                        <input className='w-full rounded-lg bg-background text-foreground p-3 text-sm border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground' type="text" name="userName" id="userName" placeholder="johndoe123" defaultValue={formData.userName} />
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <label className='text-sm font-medium text-foreground' htmlFor="organizationName">Company / Organization</label>
                                        <input className='w-full rounded-lg bg-background text-foreground p-3 text-sm border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground' type="text" name="organizationName" id="organizationName" placeholder="Acme Inc." defaultValue={formData.organizationName} />
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <label className='text-sm font-medium text-foreground' htmlFor="source">How did you find us?</label>
                                        <input className='w-full rounded-lg bg-background text-foreground p-3 text-sm border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground' type="text" name="source" id="source" placeholder="Twitter, Friend, etc." defaultValue={formData.source} />
                                    </div>

                                    <div className='flex gap-3 mt-2'>
                                        <button
                                            type="button"
                                            onClick={() => setStep('CREDENTIALS')}
                                            className='flex items-center justify-center p-3 rounded-lg border border-border hover:bg-secondary text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary'
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={nextDisabled() || loading}
                                            className={`flex-1 flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-semibold transition-all duration-200 
                                                ${(nextDisabled() || loading) ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(255,165,0,0.15)] hover:shadow-[0_0_20px_rgba(255,165,0,0.25)]'}`}
                                        >
                                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {loading ? 'Creating account...' : 'Create Account'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </>
                )}

                {step === 'VERIFICATION' && (
                    <div className='flex flex-col w-full gap-5 animate-in fade-in slide-in-from-right-4 duration-300'>
                        {localError && (
                            <div className='w-full px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium text-center'>
                                {localError}
                            </div>
                        )}
                        <form className='flex flex-col w-full gap-5' onSubmit={handleVerification}>
                            <div className='flex flex-col gap-2'>
                                <label className='text-sm font-medium text-foreground' htmlFor="code">Verification Code</label>
                                <input className='w-full rounded-lg bg-background text-foreground p-3 text-center tracking-widest text-lg font-mono border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all' type="text" name="code" id="code" placeholder="000000" maxLength={6} />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`mt-2 w-full flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-semibold transition-all duration-200 
                                    ${loading ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(255,165,0,0.15)] hover:shadow-[0_0_20px_rgba(255,165,0,0.25)] cursor-pointer'}`}
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 'OAUTH_CONTINUE' && (
                    <div className='flex flex-col w-full gap-5 animate-in fade-in slide-in-from-right-4 duration-300'>
                        {localError && (
                            <div className='w-full px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium text-center'>
                                {localError}
                            </div>
                        )}

                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium text-foreground' htmlFor='oauth-username'>Username</label>
                            <input
                                id='oauth-username'
                                type='text'
                                value={oauthUsername}
                                onChange={e => setOauthUsername(e.target.value)}
                                placeholder='johndoes123'
                                className='w-full rounded-lg bg-background text-foreground p-3 text-sm border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground'
                                onKeyDown={e => { if (e.key === 'Enter' && oauthUsername.trim()) oauthContinue(oauthUsername.trim()) }}
                            />
                        </div>

                        <button
                            disabled={!oauthUsername.trim() || loading}
                            onClick={() => oauthContinue(oauthUsername.trim())}
                            className={`mt-2 w-full flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-semibold transition-all duration-200 
                                ${!oauthUsername.trim() || loading ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(255,165,0,0.15)] hover:shadow-[0_0_20px_rgba(255,165,0,0.25)]'}`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {loading ? 'Completing...' : 'Complete Setup'}
                        </button>
                    </div>
                )}

                {step === 'CREDENTIALS' && (
                    <div className='text-sm text-center text-muted-foreground mt-2'>
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => router.push('/auth/login')}
                            className='text-primary font-medium hover:underline focus:outline-none'
                        >
                            Sign In
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Page