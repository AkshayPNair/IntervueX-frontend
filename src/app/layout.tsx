import "./globals.css";
import type { Metadata } from "next";
import {Inter} from 'next/font/google'
import { Providers } from "../components/Providers";
import { SessionProvider } from "../components/SessionProvider";
import { Toaster } from "sonner";
import { FloatingMascot } from "../components/ui/floating-mascot";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "IntervueX",
  description: "Master your technical interviews",
  icons: {
    icon: {
      url: "/favicon.svg",
      type: "image/svg+xml",
    },
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white`}>
        <Providers>
          <SessionProvider>
            {children}
            <Toaster/>
            <FloatingMascot />
            {/* <Toaster 
              position="bottom-right"
              richColors
              
              theme="dark"
            /> */}
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
