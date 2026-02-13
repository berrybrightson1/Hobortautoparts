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
    icon: "/Asset 10@288x.png",
    apple: "/Asset 10@288x.png",
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

import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-slate-900`}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
