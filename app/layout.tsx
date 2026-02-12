import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/lib/auth/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _heading = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-heading' })
const _mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Sales Lead Coach | NAVAX',
  description: 'Ultra-fast lead capture, follow-ups, and gamification powered by Microsoft Dataverse',
}

export const viewport: Viewport = {
  themeColor: '#79217a',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_inter.variable} ${_heading.variable} ${_mono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
