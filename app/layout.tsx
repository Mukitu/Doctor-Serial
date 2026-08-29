import type { Metadata } from 'next';
import React from 'react';
import appIcon from '@/app/about/MyDocBD-App-Icon.png';
import brandLogo from '@/app/about/MyDocBD-Logo.png';

const logoSrc = typeof brandLogo === 'string' ? brandLogo : (brandLogo as any)?.src || '/about/MyDocBD-Logo.png';
const appIconSrc = typeof appIcon === 'string' ? appIcon : (appIcon as any)?.src || '/about/MyDocBD-App-Icon.png';

export const metadata: Metadata = {
  title: 'MyDocBD - দেশের সেরা বিশেষজ্ঞ ডাক্তার ও চেম্বার সিরিয়াল',
  description: 'MyDocBD (mydocbd.com) — দেশের স্বনামধন্য বিশেষজ্ঞ ডাক্তারদের বিস্তারিত সময়সূচি, ভিজিট ফি এবং ঘরে বসেই অত্যন্ত সহজে চেম্বার সিরিয়াল নিশ্চিতকরণ প্ল্যাটফর্ম।',
  icons: {
    icon: [
      { url: '/about/MyDocBD-App-Icon.png', href: '/about/MyDocBD-App-Icon.png' }
    ],
    apple: [
      { url: '/about/MyDocBD-App-Icon.png' }
    ],
  },
  openGraph: {
    title: 'MyDocBD - ডিজিটাল হেলথ ডিরেক্টরি',
    description: 'দেশের সেরা বিশেষজ্ঞ চিকিৎসকদের ডিজিটাল ডিরেক্টরি ও সিরিয়াল বুকিং প্ল্যাটফর্ম।',
    url: 'https://mydocbd.com',
    siteName: 'MyDocBD',
    images: [
      {
        url: logoSrc,
        width: 1200,
        height: 630,
        alt: 'MyDocBD Logo',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyDocBD - ডিজিটাল হেলথ ডিরেক্টরি',
    description: 'দেশের সেরা বিশেষজ্ঞ চিকিৎসকদের ডিজিটাল ডিরেক্টরি ও সিরিয়াল বুকিং প্ল্যাটফর্ম।',
    images: [logoSrc],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" href={appIconSrc} />
        <link rel="apple-touch-icon" href={appIconSrc} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
