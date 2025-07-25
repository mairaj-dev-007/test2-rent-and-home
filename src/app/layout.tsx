import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/providers/SessionProvider";
import { Toaster } from 'react-hot-toast';

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Rent&Home",
  description: "Rent and Buy a home with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <div className="relative z-50">
            <Navbar />
          </div>
          <div className="relative">
            {children}
          </div>
          <div className="relative">
            <Footer />
          </div>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              success: {
                duration: 3000,
              },
              error: {
                duration: 4000,
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
