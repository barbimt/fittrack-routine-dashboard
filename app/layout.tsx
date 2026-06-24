import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { fitTrackThemeColor } from "@/lib/design-tokens";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: fitTrackThemeColor.light },
    { media: "(prefers-color-scheme: dark)", color: fitTrackThemeColor.dark },
  ],
};

export const metadata: Metadata = {
  title: "FitTrack Routine Dashboard",
  description:
    "Premium mobile-first fitness workout UI prototype — track routines, sets, and weekly progress.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="bg-background max-lg:h-dvh max-lg:overflow-hidden"
    >
      <body className="font-sans antialiased max-lg:h-full max-lg:overflow-hidden lg:min-h-screen">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
