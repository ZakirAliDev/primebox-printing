import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { readCatalog } from "@/lib/catalog-store";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { siteSettings } = await readCatalog();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} | Custom Packaging Houston, TX`,
      template: `%s | ${SITE_NAME}`,
    },
    description: `${SITE_TAGLINE} in Houston, TX. Custom boxes from 100 units, free design support, nationwide shipping.`,
    icons: siteSettings.favicon
      ? {
          icon: siteSettings.favicon,
          shortcut: siteSettings.favicon,
          apple: siteSettings.favicon,
        }
      : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-full flex-col bg-white text-navy" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
