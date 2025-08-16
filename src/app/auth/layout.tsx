'use client'
import React, { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type layout = {
    children:React.ReactNode
}

const LayoutAuth:React.FC<layout> = ({children}) => {

  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(()=>{
    if(isSignedIn){
      router.push('/')
    }
  },[isLoaded])

  if(!isLoaded){
    return <></>
  }



  return (
    <div className='flex items-center justify-center w-screen h-screen bg-background'>
        {children}
    </div>
  )
}

export default LayoutAuth