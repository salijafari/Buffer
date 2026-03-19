import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
  preload:  true,
});

export const metadata: Metadata = {
  title:       { template: '%s | Buffer', default: 'Buffer Dashboard' },
  description: 'Manage your Buffer credit line, credit score, and debt payoff progress.',
  robots:      { index: false, follow: false }, // dashboard is private
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:       true,
    statusBarStyle:'black-translucent',
    title:         'Buffer',
  },
  icons: {
    icon:  [
      { url: '/icons/icon-32.png',  sizes: '32x32',   type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor:    '#00C9A7',
  width:         'device-width',
  initialScale:  1,
  viewportFit:   'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preload JetBrains Mono for financial figures */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4xD-IQ.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        `}</style>
      </head>
      <body className="bg-[#0F1117] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
