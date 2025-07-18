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
        <link rel="icon" href="/favicon_io/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon_io/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon_io/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon_io/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />
        <title>Font Book Online</title>
        <meta
          name="description"
          content="Preview your local fonts in the browser. Fast, private, and easy font viewer for designers and developers."
        />
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
