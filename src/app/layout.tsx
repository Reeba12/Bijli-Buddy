import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BijliBuddy — K-Electric Bill Calculator Karachi",
  description:
    "Free K-Electric electricity bill calculator for Karachi. See your exact bill breakdown by slab, find which appliance costs the most, and get solar savings estimates. NEPRA tariff FY 2024-25.",
  keywords: ["K-Electric bill calculator", "bijli bill karachi", "electricity bill pakistan", "NEPRA tariff 2024"],
  openGraph: {
    title: "BijliBuddy — K-Electric Bill Calculator",
    description: "Calculate your exact K-Electric bill in seconds. Free, accurate, no login needed.",
    type: "website",
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
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        {/* Microsoft Clarity — paste your Clarity project ID below after signup at clarity.microsoft.com */}
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
