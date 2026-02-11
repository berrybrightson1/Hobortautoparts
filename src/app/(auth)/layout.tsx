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
            <div className="hidden lg:block relative bg-white overflow-hidden border-l border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 via-transparent to-primary-orange/5 z-10" />

                {/* Image Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    <span className="text-primary-blue/10 font-black text-4xl uppercase tracking-tighter">Image Placeholder</span>
                </div>

                <div className="absolute inset-0 z-20 p-16 flex flex-col justify-end">
                    <div className="space-y-4 max-w-lg">
                        <div className="h-1.5 w-12 bg-primary-orange rounded-full" />
                        <h2 className="text-4xl font-black text-primary-blue leading-tight tracking-tight">
                            The Hub for Premium <br />
                            <span className="text-primary-orange">Auto Parts Logistics.</span>
                        </h2>
                        <p className="text-primary-blue/70 font-bold text-lg leading-relaxed">
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
