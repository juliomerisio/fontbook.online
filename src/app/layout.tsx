import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Font Book Online – Local Font Preview & Manager",
  description:
    "Preview your local fonts in the browser. Fast, private, and easy font viewer for designers and developers.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Font Book Online",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  keywords: [
    "font viewer",
    "local fonts",
    "font manager",
    "typography",
    "web fonts",
    "design tools",
    "fontbook",
  ],
  authors: [{ name: "Julio Merisio" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fontbook.online",
    siteName: "Font Book Online",
    title: "Font Book Online – Local Font Preview & Manager",
    description:
      "Preview your local fonts in the browser. Fast, private, and easy font viewer for designers and developers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Font Book Online – Local Font Preview & Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Font Book Online – Local Font Preview & Manager",
    description:
      "Preview your local fonts in the browser. Fast, private, and easy font viewer for designers and developers.",
    images: ["/og-image.png"],
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Font Book Online",
    url: "https://fontbook.online/",
    description:
      "Preview your local fonts in the browser. Fast, private, and easy font viewer for designers and developers.",
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Julio Merisio",
    url: "https://juliomerisio.com",
    jobTitle: "Software Engineer & Design Engineer",
    description:
      "Software engineer with a design background, specializing in building interfaces with sharp graphics, smooth animations, and robust code.",
    sameAs: [
      "https://github.com/juliomerisio",
      "https://linkedin.com/in/juliomerisio",
      "https://twitter.com/juliomerisio",
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <meta name="application-name" content="Font Book Online" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Font Book Online" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
