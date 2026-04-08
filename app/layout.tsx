import { Geist_Mono, Inter, DM_Serif_Display } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "CAT - Teste Adaptativo",
  description: "Avaliacao adaptativa baseada na Teoria de Resposta ao Item",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("antialiased", inter.variable, geistMono.variable, dmSerif.variable)}
    >
      <body className="font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
