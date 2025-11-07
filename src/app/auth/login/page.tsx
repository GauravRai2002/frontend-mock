'use client'
import React, { useEffect, useState } from 'react'
import { useLoginUser } from '@/hooks/use-login'
import { useRouter } from 'next/navigation'

type FormDataSignIn = {
    email:string,
    password:string
}


const Page:React.FC = () => {

    const { loginUser, handleGoogleSignIn, error:loginError, loading } = useLoginUser()
    const [error, setError] = useState<string>('')
    const router = useRouter()
    const [formData, setFormData] = useState<FormDataSignIn>({
        email:'',
        password:''
    })

    const isDisabled:()=>boolean = ()=>{
        const disabledLogic = loading || !formData.email || !formData.password || formData.email.trim().length==0 || formData.password.trim().length==0
        return disabledLogic
    }


    const handleSubmit = async(formdata:FormData)=>{
        const email = formdata.get('email') as string
        const password = formdata.get('password') as string

        if(!email || !password || email.trim().length==0 || password.trim().length==0){
            setError('Please enter email and password')
            return
        }
        await loginUser({email, password})
    }

    return (
        <div className='w-[40%] h-[50%] max-w-[450px] max-h-[600px] min-w-[300px] min-h-[450px] p-4 bg-card rounded-md flex flex-col items-center justify-center gap-4 shadow-lg shadow-foreground'>
            <div className='w-full flex flex-col items-center justify-center gap-4 text-accent-foreground px-10'>
                <div className='flex flex-col items-center justify-center text-accent-foreground'>
                    <div className='text-xl font-bold'>Sign in to MockBird</div>
                    <p className='text-sm text-center'>Welcome back! Please sign in to continue</p>
                </div>

                {/* Sign in with google button */}

                <button onClick={handleGoogleSignIn} className='bg-accent w-full rounded-md p-2 cursor-pointer text-primary'>
                    Sign in with google
                </button>

                <div className='flex items-center justify-center gap-2 w-full my-4'>
                    <div className='h-0.5 bg-accent-foreground w-[40%]'></div>
                    <div>OR</div>
                    <div className='h-0.5 bg-accent-foreground w-[40%]'></div>
                </div>

                {loginError.length>0&&<div className='w-full h-auto px-4 py-2 bg-destructive-foreground border-1 border-destructive rounded-md text-destructive text-center'>
                    {loginError}
                </div>}

                <form className='flex flex-col items-center justify-center w-full gap-6' action={handleSubmit} onChange={(e)=>{
                    const _formData = e.currentTarget
                    const formData = new FormData(_formData)

                    const email = formData.get('email') as string;
                    const password = formData.get('password') as string;

                    setFormData((prev)=>{
                        return {...prev,
                        email:email,
                        password:password}
                    })
                }}>
                    <div className='w-full flex flex-col items-start justify-center gap-2'>
                        <label className='text-lg' htmlFor="email">Email</label>
                        <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="email" name="email" id="email" />
                    </div>
                    <div className='w-full flex flex-col items-start justify-center gap-2'>
                        <label className='text-lg' htmlFor="password">Password</label>
                        <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="password" name="password" id="password" />
                    </div>


                    <input disabled={isDisabled()} className={`w-full flex items-center justify-center gap-2 ${isDisabled() ? 'bg-secondary cursor-not-allowed' : 'bg-primary cursor-pointer'}  rounded-md p-2  text-background`} type="submit" value="Submit" />

                </form>
            </div>
            <div className='text-primary'>Don&apos;t have an account? <span onClick={()=>{
                router.push('/auth/signup')
            }} className='text-foreground underline cursor-pointer'>Sign Up</span></div>
        </div>
    )
}

export default Page