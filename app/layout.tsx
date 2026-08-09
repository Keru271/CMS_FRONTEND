import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/src/components/providers/HeroUIProvider";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NovaShop - Modern E-Commerce Shopping Platform",
  description: "Next-generation shopping alternative platform built with Next.js, Tailwind CSS, HeroUI, Formik, and Axios.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <ProtectedRoute>
            {children}</ProtectedRoute>
        </Providers>
      </body>
    </html>
  );
}
