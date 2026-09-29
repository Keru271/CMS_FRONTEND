import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/src/components/providers/HeroUIProvider';
import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CookieConsent } from '@/src/components/ui/CookieConsent';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OmniStore CMS — Master Control Dashboard',
  description:
    'High-performance multi-tenant E-Commerce Management Platform built with Next.js, Fastify, and Tailwind CSS.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#121212',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#121212] text-[#FFFFFF] font-sans selection:bg-[#00E5FF] selection:text-[#121212]">
        <Providers>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_CLIENT_ID || ''}>
            <ProtectedRoute>{children}</ProtectedRoute>
            <CookieConsent />
          </GoogleOAuthProvider>
        </Providers>
      </body>
    </html>
  );
}
