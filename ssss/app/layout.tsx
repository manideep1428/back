import { Geist_Mono, Raleway, Space_Grotesk } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import ConvexClientProvider from "@/components/ConvexClientProvider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import "./globals.css"

const spaceGroteskHeading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" })
const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bGl2ZS1tb2NrbGFiZWwtOTgudmFsaWQudmFsLmNsa2FjY291bnRzLmRldiQ"}>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn("antialiased", fontMono.variable, "font-sans", raleway.variable, spaceGroteskHeading.variable)}
      >
        <body className="bg-[#060609] text-slate-100 antialiased min-h-screen">
          <ThemeProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
