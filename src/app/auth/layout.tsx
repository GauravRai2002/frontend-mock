'use client'
import React, { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type layout = {
    children:React.ReactNode
}

const layoutAuth = ({children}:layout) => {

  const { userId, sessionId, isSignedIn, isLoaded } = useAuth()
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

export default layoutAuth