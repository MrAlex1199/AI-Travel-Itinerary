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
  title: 'AI Travel Itinerary',
  description: 'Generate personalized travel itineraries with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={ptSans.className}>
        <ThemeProvider>
          <Navigation />
          <main className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 scrollbar-thin">
            <div className="py-8">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
