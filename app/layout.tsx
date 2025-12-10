import type { Metadata } from 'next'
import { PT_Sans } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { ThemeProvider } from '@/components/ThemeProvider'

const ptSans = PT_Sans({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Travel Itinerary | แผนการเดินทางด้วย AI',
  description: 'Generate personalized travel itineraries with AI - สร้างแผนการเดินทางที่เหมาะกับคุณด้วยปัญญาประดิษฐ์',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={ptSans.className}>
        <ThemeProvider>
          <Navigation />
          <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="py-8">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
