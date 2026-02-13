import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { FloatingCTA } from "@/components/marketing/floating-cta";

export default function MarketingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />

            {/* Global Floating CTA - Mobile Only */}
            <FloatingCTA />
        </div>
    );
}
