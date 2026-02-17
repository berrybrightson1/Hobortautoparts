import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hobort Auto Parts Express",
  description: "Ghana's specialized Request for Quote (RFQ) platform for US auto parts.",
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
        url: "/Asset 10@288x.png",
        width: 800,
        height: 600,
        alt: "Hobort Auto Parts Express Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

import Providers from "@/app/providers";
import { createClient } from "@/lib/supabase/server";
import { ChatWidget } from "@/components/chat/chat-widget";

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
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
