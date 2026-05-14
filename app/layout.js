import "./globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Analytics } from "@vercel/analytics/next"
import Script from 'next/script'

export const metadata = {
  title: "EWU Student's Desk - Course Planning, Routine Generation & CGPA Calculator",
  description: "Your comprehensive portal for East West University course planning, routine generation, and CGPA calculation. Built for EWU students.",
  icons: {
    icon: [
      {
        url: '/favicon-16x16.svg',
        sizes: '16x16',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon-32x32.svg',
        sizes: '32x32',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-DXXZRKZ1MN"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-DXXZRKZ1MN');
        `}
      </Script>
      <body
        className={`antialiased bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen flex flex-col`}
      >
        
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
