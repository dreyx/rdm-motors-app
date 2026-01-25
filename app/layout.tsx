import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RDM Motors LLC - Quality Used Cars in Williamson, IA",
  description:
    "Browse our selection of quality used vehicles at RDM Motors LLC in Williamson, Iowa. Find your next car today!",
  metadataBase: new URL("https://rdmmotors.com"),
  canonical: "https://rdmmotors.com",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "RDM Motors LLC - Quality Used Cars in Williamson, IA",
    description: "Browse our selection of quality used vehicles at RDM Motors LLC",
    url: "https://rdmmotors.com",
    siteName: "RDM Motors LLC",
    type: "website",
  },
    generator: 'v0.app'
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
      </body>
    </html>
  )
}
