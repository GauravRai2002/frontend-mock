'use client'
import React, { useState } from 'react'
import { useLoginUser } from '@/hooks/use-login'
import { useRouter } from 'next/navigation'



const Page:React.FC = () => {

    const { loginUser } = useLoginUser()
    const [error, setError] = useState<string>('')
    const router = useRouter()

    const handleSubmit = async(formdata:FormData)=>{
        const email = formdata.get('email') as string
        const password = formdata.get('password') as string

        if(!email || !password || email.trim().length==0 || password.trim().length==0){
            setError('Please enter email and password')
            return
        }
        await loginUser({email, password})
    }
    //TODO: remove this
    console.log(error)

    return (
        <div className='w-[40%] h-[50%] max-w-[450px] max-h-[600px] min-w-[300px] min-h-[450px] p-4 bg-card rounded-md flex flex-col items-center justify-center gap-4 shadow-lg shadow-foreground'>
            <div className='w-full flex flex-col items-center justify-center gap-4 text-accent-foreground px-10'>
                <div className='flex flex-col items-center justify-center text-accent-foreground'>
                    <div className='text-xl font-bold'>Sign in to MockBird</div>
                    <p className='text-sm text-center'>Welcome back! Please sign in to continue</p>
                </div>

                {/* Sign in with google button */}

                <button className='bg-accent w-full rounded-md p-2 cursor-pointer text-primary'>
                    Sign in with google
                </button>

                <div className='flex items-center justify-center gap-2 w-full my-4'>
                    <div className='h-0.5 bg-accent-foreground w-[40%]'></div>
                    <div>OR</div>
                    <div className='h-0.5 bg-accent-foreground w-[40%]'></div>
                </div>

                <form className='flex flex-col items-center justify-center w-full gap-6' action={handleSubmit}>
                    <div className='w-full flex flex-col items-start justify-center gap-2'>
                        <label className='text-lg' htmlFor="email">Email</label>
                        <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="email" name="email" id="email" />
                    </div>
                    <div className='w-full flex flex-col items-start justify-center gap-2'>
                        <label className='text-lg' htmlFor="password">Password</label>
                        <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="password" name="password" id="password" />
                    </div>


                    <input className='w-full flex items-center justify-center gap-2 bg-primary rounded-md p-2 cursor-pointer text-background' type="submit" value="Submit" />

                </form>
            </div>
            <div className='text-primary'>already have an account? <span onClick={()=>{
                router.push('/auth/login')
            }} className='text-foreground underline cursor-pointer'>Login</span></div>
        </div>
    )
}

export default Page