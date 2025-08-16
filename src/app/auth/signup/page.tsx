'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSignupUser } from '@/hooks/use-signup'


type STEP = 'CREDENTIALS' | 'ORGANIZATION_DATA' | 'VERIFICATION'

type FormDataSignUp = {
    email:string,
    password:string,
    firstName:string,
    lastName:string,
    organizationName:string,
    source:string,
    userName:string,
}




const Page:React.FC = () => {

    const { signUpUser, verifyEmailCode, handleGoogleSignUp } = useSignupUser()
    const [error, setError] = useState<string>('')
    const router = useRouter()
    const [step, setStep] = useState<STEP>('CREDENTIALS')
    const [formData, setFormData] = useState<FormDataSignUp>({
        email:'',
        password:'',
        firstName:'',
        lastName:'',
        organizationName:'',
        source:'',
        userName:''
    })
    const nextDisabled = (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.organizationName || !formData.userName || formData.email.trim().length==0 || formData.password.trim().length==0 || formData.firstName.trim().length==0 || formData.lastName.trim().length==0 || formData.organizationName.trim().length==0 || formData.userName.trim().length==0)

    const handleSubmit = async(formdata:FormData)=>{
        const email = formdata.get('email') as string
        const password = formdata.get('password') as string
        const organizationName = formdata.get('organizationName') as string
        const firstName = formdata.get('firstName') as string
        const lastName = formdata.get('lastName') as string
        const source = formdata.get('source') as string
        const userName = formdata.get('userName') as string

        if(!email || !password || !firstName || !lastName || !userName || !organizationName || email.trim().length==0 || password.trim().length==0 || firstName.trim().length==0 || lastName.trim().length==0 || organizationName.trim().length==0 || userName.trim().length==0){
            setError('Please enter all the details')
            return
        }
        await signUpUser({email, password, firstName, lastName, organizationName, source, userName, setStep})
    }

    const handleVerification = async(formData:FormData)=>{
        const code = formData.get('code') as string

        try{
            await verifyEmailCode({verificationCode:code})
            // router.push('/')
        }catch(err){
            console.error(err)
        }
    }

    //TODO: remove this
    console.log(error)

    return (
        <div className='w-[40%] h-fit max-w-[450px] py-6 min-w-[300px] min-h-[450px] p-4 bg-card rounded-md flex flex-col items-center justify-center gap-4 shadow-lg shadow-foreground'>
            {step!=='VERIFICATION' && <div className='w-full flex flex-col items-center justify-center gap-4 text-accent-foreground px-10'>
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

                <form className='flex flex-col items-center justify-center w-full gap-6' onChange={(e)=>{
                    const _formData = e.currentTarget;
                    const formData = new FormData(_formData)

                    const email = formData.get('email') as string
                    const password = formData.get('password') as string
                    const organizationName = formData.get('organizationName') as string
                    const firstName = formData.get('firstName') as string
                    const lastName = formData.get('lastName') as string
                    const source = formData.get('source') as string
                    const userName = formData.get('userName') as string

                    setFormData((prev:FormDataSignUp)=>{
                        return {
                            ...prev,
                            email,
                            password,
                            firstName,
                            lastName,
                            organizationName,
                            source,
                            userName
                        }
                    })
                }} action={handleSubmit}>
                    <div className={`w-full  flex flex-col items-start justify-center gap-2`}>
                        <label className='text-lg' htmlFor="email">Email</label>
                        <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="email" name="email" id="email" />
                    </div>

                    <div className={`w-full  flex flex-col items-start justify-center gap-2`}>
                        <label className='text-lg' htmlFor="password">Password</label>
                        <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="password" name="password" id="password" />
                    </div>

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



                    <input disabled={nextDisabled} className={`w-full flex items-center justify-center gap-2 ${nextDisabled?'bg-secondary cursor-not-allowed':'bg-primary cursor-pointer'}  rounded-md p-2  text-background`} type="submit" value='SUBMIT'/>


                </form>
            </div>}
            {step==='VERIFICATION' && <div className='w-full flex flex-col items-center justify-center gap-4 text-accent-foreground px-10'>
                <div className='flex flex-col items-center justify-center text-accent-foreground'>
                    <div className='text-xl font-bold'>Email sent to {formData.email}</div>
                    <p className='text-sm text-center'>Please enter the verification code sent to the email</p>
                </div>

                <form className='flex flex-col items-center justify-center w-full gap-6' action={handleVerification}>
                    <div className={`w-full  flex flex-col items-start justify-center gap-2`}>
                        <label className='text-lg' htmlFor="code">Code</label>
                        <input className='border border-[1.5px w-full rounded-md p-2 focus:outline-none' type="text" name="code" id="code" />
                    </div>

                    <input disabled={nextDisabled} className={`w-full flex items-center justify-center gap-2 ${nextDisabled?'bg-secondary cursor-not-allowed':'bg-primary cursor-pointer'}  rounded-md p-2  text-background`} type="submit" value='SUBMIT'/>


                </form>
            </div>}
            {step==='CREDENTIALS' && <div className='text-primary'>already have an account? <span onClick={()=>{
                router.push('/auth/login')
            }} className='text-foreground underline cursor-pointer'>Login</span></div>}
        </div>
    )
}

export default Page