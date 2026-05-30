import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google"

import { ReactQueryProvider } from "@/components/providers/react-query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { siteMetadata, siteViewport } from "@/config/site"
import { cn } from "@/lib/utils"
import NextTopLoader from "nextjs-toploader"
import "./globals.css"

const sans = Be_Vietnam_Pro({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = siteMetadata
export const viewport = siteViewport

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        sans.variable
      )}
    >
      <body className="relative">
        <ReactQueryProvider>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </ReactQueryProvider>
        <Toaster
          position="top-right"
          theme="system"
          duration={8000}
          // richColors
        />
        <NextTopLoader
          color="var(--primary)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={2}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
      </body>
    </html>
  )
}
