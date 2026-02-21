'use client'
import React, { useEffect, useState } from 'react'
import { useLoginUser } from '@/hooks/use-login'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

type FormDataSignIn = {
    email: string,
    password: string
}

const Page: React.FC = () => {

    const { loginUser, handleGoogleSignIn, error: loginError, loading } = useLoginUser()
    const [error, setError] = useState<string>('')
    const router = useRouter()
    const [formData, setFormData] = useState<FormDataSignIn>({
        email: '',
        password: ''
    })

    const isDisabled: () => boolean = () => {
        return loading || !formData.email || !formData.password || formData.email.trim().length === 0 || formData.password.trim().length === 0
    }

    const handleSubmit = async (formdata: FormData) => {
        const email = formdata.get('email') as string
        const password = formdata.get('password') as string

        if (!email || !password || email.trim().length === 0 || password.trim().length === 0) {
            setError('Please enter email and password')
            return
        }
        await loginUser({ email, password })
    }

    return (
        <div className='w-full max-w-md p-8 bg-card rounded-2xl flex flex-col items-center border border-border/50 shadow-2xl relative overflow-hidden'>
            {/* Background subtle glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>

            <div className='w-full flex flex-col items-center gap-8 relative z-10'>
                <div className='flex flex-col items-center gap-2 text-center'>
                    <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>Sign in to MockBird</h1>
                    <p className='text-muted-foreground text-sm'>Welcome back! Please sign in to continue</p>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className='w-full flex justify-center items-center gap-2 rounded-lg p-3 cursor-pointer bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors border border-border/50'
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className='flex items-center w-full'>
                    <div className='h-px bg-border flex-1'></div>
                    <span className='px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest'>Or continue with email</span>
                    <div className='h-px bg-border flex-1'></div>
                </div>

                {loginError && (
                    <div className='w-full px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium text-center animate-in fade-in zoom-in-95 duration-200'>
                        {loginError}
                    </div>
                )}
                {error && !loginError && (
                    <div className='w-full px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium text-center animate-in fade-in zoom-in-95 duration-200'>
                        {error}
                    </div>
                )}

                <form className='flex flex-col w-full gap-5' action={handleSubmit} onChange={(e) => {
                    const _formData = e.currentTarget
                    const formData = new FormData(_formData)

                    const email = formData.get('email') as string;
                    const password = formData.get('password') as string;

                    setFormData({ email, password })
                }}>
                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-foreground' htmlFor="email">Email address</label>
                        <input
                            className='w-full rounded-lg bg-background text-foreground p-3 text-sm border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground'
                            type="email"
                            name="email"
                            id="email"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-foreground' htmlFor="password">Password</label>
                        <input
                            className='w-full rounded-lg bg-background text-foreground p-3 text-sm border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground'
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        disabled={isDisabled()}
                        className={`mt-2 w-full flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-semibold transition-all duration-200 
                            ${isDisabled() ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(255,165,0,0.15)] hover:shadow-[0_0_20px_rgba(255,165,0,0.25)]'}`}
                        type="submit"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className='text-sm text-muted-foreground'>
                    Don&apos;t have an account?{' '}
                    <button
                        type="button"
                        onClick={() => router.push('/auth/signup')}
                        className='text-primary font-medium hover:underline focus:outline-none'
                    >
                        Sign up
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Page