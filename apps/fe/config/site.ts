import { Metadata, Viewport } from "next"

export const siteConfig = {
  title: "Leaf",
  siteName: "Leaf",
  description: "Leaf is a AI Tutor system that helps you learn and grow.",
  url: "https://demo.truong.cloud",
  logo: "/leaf.png",
  favicon: "/leaf.png",
  author: { name: "Truong", url: "https://truong.cloud" },
}

export const siteMetadata: Metadata = {
  authors: [siteConfig.author],
  title: {
    default: siteConfig.title,
    template: `%s • ${siteConfig.title}`,
  },
  description: siteConfig.description,
  icons: {
    icon: siteConfig.logo,
    apple: siteConfig.logo,
    shortcut: siteConfig.logo,
    other: [{ rel: "apple-touch-icon-precomposed", url: siteConfig.logo }],
  },
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.siteName,
    images: [
      {
        url: siteConfig.logo,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  manifest: "/manifest.json",
  keywords: [
    siteConfig.title,
    "document management",
    "search",
    "share",
    "organize",
  ],
}

export const siteViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}
