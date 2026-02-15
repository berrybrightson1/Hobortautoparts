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
            closeButton
            toastOptions={{
              classNames: {
                toast: "group rounded-xl shadow-2xl p-4 gap-4",
                title: "font-bold text-sm !text-white",
                description: "text-xs font-medium !text-white/90",
                closeButton: "!bg-white/10 !border-white/20 !text-white hover:!bg-white/20 hover:!border-white/30 transition-all [&>svg]:!text-white [&>svg]:!stroke-white",
                actionButton: "!bg-white !text-slate-900 hover:!bg-white/90 !font-bold !shadow-lg",
                success: "!bg-emerald-600 !border-emerald-700",
                error: "!bg-red-600 !border-red-700",
                info: "!bg-[#1b4e6f] !border-[#0f2d40]",
                warning: "!bg-[#fe8323] !border-[#e6761d]"
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
