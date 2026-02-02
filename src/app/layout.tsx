import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VendorFinder - Find Equipment Vendors Before Your Competition',
  description:
    'The only tool that combines AI-powered lead generation with real-time marketplace monitoring to find skid steer and excavator vendors ready for financing partnerships.',
  keywords: [
    'equipment financing',
    'vendor leads',
    'construction equipment',
    'financing broker',
    'lead generation',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
