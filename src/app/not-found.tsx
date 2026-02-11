import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PackageSearch, Home, MessageCircle } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)",
                backgroundSize: "32px 32px"
            }}></div>

            <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center gap-8">
                <div className="relative">
                    <h1 className="text-[12rem] font-black text-slate-200 leading-none select-none">404</h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 rotate-12 animate-pulse">
                        <PackageSearch className="h-16 w-16 text-primary-orange" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-primary-blue tracking-tight">Lost in Transit?</h2>
                    <p className="text-slate-500 text-lg">
                        The page you are looking for seems to have been shipped to an unknown location.
                        Let's get you back on track.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/">
                        <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg bg-primary-blue hover:bg-primary-blue/90">
                            <Home className="mr-2 h-4 w-4" /> Return Home
                        </Button>
                    </Link>
                    <Link href="/quote">
                        <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base border-2 bg-white">
                            Start Sourcing
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 text-slate-400 text-sm font-medium">
                Error Code: NOT_FOUND_IN_MANIFEST
            </div>
        </div>
    )
}
