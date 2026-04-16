import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/lib/theme";
import { LangProvider } from "@/lib/i18n";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BijliBuddy — K-Electric Bill Calculator Karachi",
  description:
    "Free K-Electric electricity bill calculator for Karachi. See your exact bill breakdown by slab, find which appliance costs the most, and get solar savings estimates. NEPRA tariff FY 2024-25.",
  keywords: ["K-Electric bill calculator", "bijli bill karachi", "electricity bill pakistan", "NEPRA tariff 2024", "بجلی بل کراچی"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BijliBuddy",
  },
  openGraph: {
    title: "BijliBuddy — K-Electric Bill Calculator",
    description: "Calculate your exact K-Electric bill in seconds. Free, accurate, no login needed.",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "BijliBuddy — K-Electric Bill Calculator",
    description: "Calculate your exact K-Electric bill in seconds. Free, accurate, no login needed.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#060d1f" },
    { media: "(prefers-color-scheme: light)", color: "#f0f4ff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <head>
        {/* PWA */}
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Microsoft Clarity */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LangProvider>
            <AppShell>
              {children}
            </AppShell>
          </LangProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
