import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AppStateProvider } from "@/lib/app-state"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Padharo Thal & Banquet - Hotel Management",
  description: "Complete hotel management system for Padharo Thal & Banquet",
  icons: {
    icon: [
      {
        url: "/images/padharo-dhal-28hotel-29-logo.jpg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/images/padharo-dhal-28hotel-29-logo.jpg",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/images/padharo-dhal-28hotel-29-logo.jpg",
        type: "image/svg+xml",
      },
    ],
    apple: "/images/padharo-dhal-28hotel-29-logo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AppStateProvider>
          {children}
          <Analytics />
        </AppStateProvider>
      </body>
    </html>
  )
}
