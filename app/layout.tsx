import type { Metadata, Viewport } from "next";
import { Lexend, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/src/components/providers/HeroUIProvider";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { GoogleOAuthProvider } from "@react-oauth/google";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-code-saver",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Wendr CMS — Warm Editorial Platform",
  description:
    "Wendr-styled E-Commerce CMS Platform built with Next.js, Tailwind CSS, HeroUI, Formik, and Axios.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fdf1ef",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log({ clientId: process.env.NEXT_PUBLIC_CLIENT_ID });
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fdf1ef] text-[#191a1b] font-sans selection:bg-[#191a1b] selection:text-[#d4ff4c]">
        <Providers>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_CLIENT_ID}>
            <ProtectedRoute>{children}</ProtectedRoute>
          </GoogleOAuthProvider>
        </Providers>
      </body>
    </html>
  );
}
