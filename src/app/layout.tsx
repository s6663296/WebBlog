import type { Metadata } from "next";
import { Noto_Sans_TC, Space_Grotesk } from "next/font/google";
import { getSiteTitle } from "@/lib/site-title";
import { IntroOverlay } from "@/components/intro-overlay";
import { NavigationTransition } from "@/components/navigation-transition";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const bodyFont = Noto_Sans_TC({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = await getSiteTitle();

  return {
    title: siteTitle,
    description: "Modern dark personal blog with secure admin dashboard.",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        <IntroOverlay />
        {children}
        <NavigationTransition />
      </body>
    </html>
  );
}
