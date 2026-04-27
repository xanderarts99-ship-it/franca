import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rammies Vacation Rentals | Home Away From Home",
    template: "%s | Rammies Vacation Rentals",
  },
  description:
    "Discover premium vacation rental homes in Katy and Fulshear, Texas. Rammies Vacation Rentals offers beautiful, fully-equipped properties perfect for families, corporate travelers, and groups. Book your home away from home today.",
  keywords: [
    "vacation rentals Katy Texas",
    "short term rentals Katy TX",
    "Airbnb alternative Katy",
    "vacation homes Fulshear Texas",
    "family vacation rental Houston",
    "corporate housing Katy Texas",
    "Rammies Vacation Rentals",
    "home away from home Katy",
    "pet friendly vacation rental Texas",
    "vacation rental near Katy Mills",
    "vacation rental near Typhoon Texas",
  ],
  authors: [{ name: "Rammies Vacation Rentals" }],
  creator: "Rammies Vacation Rentals",
  publisher: "Rammies Vacation Rentals",
  metadataBase: new URL("https://www.rammiesvacation.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.rammiesvacation.com",
    siteName: "Rammies Vacation Rentals",
    title: "Rammies Vacation Rentals | Home Away From Home",
    description:
      "Premium vacation rental homes in Katy and Fulshear, Texas. Perfect for families, corporate travelers, and groups. Fully equipped, clean, and comfortable.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rammies Vacation Rentals — Home Away From Home",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rammies Vacation Rentals | Home Away From Home",
    description: "Premium vacation rental homes in Katy and Fulshear, Texas.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", sizes: "512x512" },
    ],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "REPLACE_WITH_GOOGLE_VERIFICATION_CODE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
