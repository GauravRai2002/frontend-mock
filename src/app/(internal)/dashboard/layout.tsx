import React from 'react'

export default function RootLayout({children}:{children:React.ReactNode}){
    return <div className='h-screen flex-1'>
        {children}
    </div>
}