import Navbar from '@/components/Navbar'
import React from 'react'

export default function RootLayout({children}:{children:React.ReactNode}){

    return <div className='relative flex items-start justify-start h-screen'>
        <Navbar/>
        {children}
    </div>
}