import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side: Form */}
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12 bg-white relative">
                <div className="w-full max-w-sm mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-start">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-2 text-slate-400 hover:text-primary-blue transition-all font-bold text-sm bg-slate-50 px-6 py-3 rounded-full hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                            Back to Home
                        </Link>
                    </div>
                    {children}

                    <p className="text-center text-xs text-slate-400 font-medium">
                        © {new Date().getFullYear()} Hobort Auto Parts Express. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right side: Branding area */}
            <div className="hidden lg:block relative bg-slate-900 overflow-hidden border-l border-slate-100">
                {/* Background Image with Parallax-ready feel */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-110 lg:scale-105"
                    style={{ backgroundImage: "url('/auth-customer.webp')" }}
                />

                {/* Rich Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue via-primary-blue/40 to-transparent z-10 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/20 via-transparent to-primary-orange/20 z-10" />

                <div className="absolute inset-0 z-20 p-16 flex flex-col justify-end">
                    <div className="space-y-4 max-w-lg">
                        <div className="h-1.5 w-12 bg-primary-orange rounded-full shadow-lg" />
                        <h2 className="text-4xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                            The Hub for Premium <br />
                            <span className="text-primary-orange">Auto Parts Logistics.</span>
                        </h2>
                        <p className="text-white/80 font-bold text-lg leading-relaxed max-w-md">
                            Efficient sourcing, real-time tracking, and seamless logistics for auto parts worldwide.
                        </p>
                    </div>
                </div>

                {/* Decorative dots using brand colors */}
                <div className="absolute top-12 right-12 grid grid-cols-4 gap-2 z-20 opacity-20">
                    {[...Array(16)].map((_, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary-blue" />
                    ))}
                </div>
            </div>
        </div>
    )
}
