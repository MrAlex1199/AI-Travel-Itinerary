import type { Metadata } from 'next'
import { PT_Sans } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'

const ptSans = PT_Sans({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Travel Itinerary',
  description: 'Generate personalized travel itineraries with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={ptSans.className}>
        <Navigation />
        <main className="min-h-screen bg-gray-50 transition-page">
          <div className="py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
