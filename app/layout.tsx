import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppToaster } from "@/components/fitness/app-toaster";
import { VisualViewportSync } from "@/components/visual-viewport-sync";
import { SelectedTrainingDayProvider } from "@/features/routines/selected-training-day-context";
import { fitTrackThemeColor } from "@/lib/design-tokens";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Let the keyboard overlay. iOS Chrome mis-resizes dvh and leaves a blank band.
  interactiveWidget: "overlays-content",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: fitTrackThemeColor.light },
    { media: "(prefers-color-scheme: dark)", color: fitTrackThemeColor.dark },
  ],
};

export const metadata: Metadata = {
  title: "FitTrack Routine Dashboard",
  description:
    "Mobile-first strength routine app — track workouts by completed sets, import routines, and log sessions.",
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
    <html lang="en" className="bg-background overflow-hidden">
      <body className="h-full overflow-hidden font-sans antialiased">
        <Script id="visual-viewport-boot" strategy="beforeInteractive">
          {`(function(){try{var vv=window.visualViewport;var height=Math.round(vv?vv.height:window.innerHeight);var offset=Math.round(vv?vv.offsetTop:0);var style=document.createElement("style");style.id="vv-boot";style.textContent="html{--vv-height:"+height+"px;--vv-offset-top:"+offset+"px}";document.head.appendChild(style);}catch(e){}})();`}
        </Script>
        <VisualViewportSync />
        <SelectedTrainingDayProvider>{children}</SelectedTrainingDayProvider>
        <AppToaster />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
