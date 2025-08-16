'use client'
import {
  ClerkProvider,
  // SignedIn,
  // SignedOut,
} from '@clerk/nextjs'
import React from 'react'


const ClerkProviderClient = ({children}:{children:React.ReactNode}) => {
  return (
    <ClerkProvider signInFallbackRedirectUrl={'/auth/login'} signUpForceRedirectUrl={'/auth/signup'} signInUrl="/auth/signin"
      signUpUrl="/auth/signup">
        {children}
    </ClerkProvider>
  )
}

export default ClerkProviderClient