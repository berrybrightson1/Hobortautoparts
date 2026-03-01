import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hobortautoexpress.com"),
  title: {
    default: "Hobort Auto Parts Express | Ghana's Premium US Auto Parts RFQ Platform",
    template: "%s | Hobort Auto Parts Express",
  },
  description: "Ghana's specialized Request for Quote (RFQ) platform for US auto parts. Source genuine, high-quality auto parts directly from the United States with transparent tracking and dedicated agents.",
  keywords: ["auto parts Ghana", "US auto parts", "car parts Accra", "OEM parts Ghana", "auto logistics", "Hobort Auto Parts Express"],
  authors: [{ name: "Hobort Auto Parts Express" }],
  creator: "Hobort Auto Parts Express",
  publisher: "Hobort Auto Parts Express",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/icon.png",
  },
  openGraph: {
    title: "Hobort Auto Parts Express",
    description: "Ghana's specialized Request for Quote (RFQ) platform for US auto parts. Source genuine US auto parts with ease.",
    url: "https://hobortautoexpress.com",
    siteName: "Hobort Auto Parts Express",
    images: [
      {
        url: "/Asset%2010@288x.png",
        width: 800,
        height: 600,
        alt: "Hobort Auto Parts Express Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hobort Auto Parts Express",
    description: "Ghana's specialized Request for Quote (RFQ) platform for US auto parts. Source genuine US auto parts with ease.",
    images: ["/Asset%2010@288x.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import Providers from "@/app/providers";
import { createClient } from "@/lib/supabase/server";
import { ChatWidget } from "@/components/chat/chat-widget";
import { GlobalNotificationProvider } from "@/components/portal/global-notification-provider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-slate-900`}>
        <Providers initialSession={session}>
          <GlobalNotificationProvider>
            {children}
            <ChatWidget />
          </GlobalNotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
