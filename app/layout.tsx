import type { Metadata } from "next";
import { Inter, Roboto, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Google Fonts - Modern, Profesional, Resmi
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smiling West Java - Portal Pariwisata Jawa Barat",
  description: "Portal resmi pariwisata Jawa Barat. Jelajahi keindahan alam, budaya, dan kuliner khas Jawa Barat.",
  openGraph: {
    title: "Smiling West Java - Portal Pariwisata Jawa Barat",
    description: "Portal resmi pariwisata Jawa Barat. Jelajahi keindahan alam, budaya, dan kuliner khas Jawa Barat.",
    siteName: "Smiling West Java",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smiling West Java - Portal Pariwisata Jawa Barat",
    description: "Portal resmi pariwisata Jawa Barat. Jelajahi keindahan alam, budaya, dan kuliner khas Jawa Barat.",
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2' },
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png?v=2', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-192x192.png?v=2', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon-57x57.png?v=2', sizes: '57x57', type: 'image/png' },
      { url: '/favicon-60x60.png?v=2', sizes: '60x60', type: 'image/png' },
      { url: '/favicon-72x72.png?v=2', sizes: '72x72', type: 'image/png' },
      { url: '/favicon-76x76.png?v=2', sizes: '76x76', type: 'image/png' },
      { url: '/favicon-114x114.png?v=2', sizes: '114x114', type: 'image/png' },
      { url: '/favicon-120x120.png?v=2', sizes: '120x120', type: 'image/png' },
      { url: '/favicon-144x144.png?v=2', sizes: '144x144', type: 'image/png' },
      { url: '/favicon-152x152.png?v=2', sizes: '152x152', type: 'image/png' },
      { url: '/favicon-180x180.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  other: {
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${roboto.variable} ${plusJakartaSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
