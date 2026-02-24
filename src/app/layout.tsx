import { type Metadata } from 'next'
import ClerkProviderClient from './ClerkProviderClient'
import { ToastProvider } from '@/components/Toast'
import './globals.css'


export const metadata: Metadata = {
  title: 'MockBird',
  description: 'A platform to mock your backend',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProviderClient>
      <html lang="en">
        <body className={`antialiased dark`}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </body>
      </html>
    </ClerkProviderClient>
  )
}