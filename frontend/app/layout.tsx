import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { ScrollToTop } from "@/components/scroll-to-top"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DPBD - Direktorat Pengembangan Bisnis dan Dana Abadi | PPI Dunia",
  description:
    "Platform donasi berkelanjutan untuk membangun masa depan pelajar Indonesia di seluruh dunia. Transparan, aman, dan terpercaya di bawah naungan PPI Dunia.",
  keywords: ["donasi", "PPI Dunia", "beasiswa", "pelajar Indonesia", "dana abadi", "transparansi"],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#5c1a1a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        <script src="https://app.sandbox.midtrans.com/snap/snap.js" async></script>
      </head>
      <body className="font-sans antialiased">
        <ScrollToTop />
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
