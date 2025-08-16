import { type Metadata } from 'next'
import ClerkProviderClient from './ClerkProviderClient'
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
          {children}
        </body>
      </html>
    </ClerkProviderClient>
  )
}