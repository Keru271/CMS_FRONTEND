import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/src/components/providers/HeroUIProvider';
import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CookieConsent } from '@/src/components/ui/CookieConsent';
import { GlobalModalScrollLock } from '@/src/components/ui/GlobalModalScrollLock';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
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
  themeColor: '#F8FAFC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased light`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cms_theme');var d=t==='dark';if(d){document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');document.documentElement.setAttribute('data-theme','light');document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans transition-colors duration-200 selection:bg-[#00E5FF] selection:text-[#121212]">
        <GlobalModalScrollLock />
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
