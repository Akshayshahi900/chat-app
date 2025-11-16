import type { Metadata } from "next";
import "./globals.css"
import WakeBackend from "./wakeBackend";
// import { Suspense } from "react";


export const metadata: Metadata = {
  title: "Zing",
  description: "A Real Time Chat Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
   <html lang="en" className="antialiased" suppressHydrationWarning>
         <body className="min-h-screen bg-background text-foreground">
       
          <WakeBackend>
          <main className="min-h-[80svh]">{children}</main>
        </WakeBackend>
     
      </body>
    </html>
  )
}
