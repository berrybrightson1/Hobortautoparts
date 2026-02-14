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
          <Toaster
            position="bottom-right"
            theme="dark"
            closeButton
            toastOptions={{
              classNames: {
                toast: "group rounded-xl border border-white/10 shadow-2xl bg-black text-white p-4 gap-4",
                title: "font-bold text-sm",
                description: "text-slate-400 text-xs font-medium",
                closeButton: "bg-black border-white/20 text-white hover:bg-white hover:text-black transition-all"
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
