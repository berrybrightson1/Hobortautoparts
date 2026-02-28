import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, ShieldCheck, Globe } from "lucide-react"
import Link from "next/link"

export default function LearnMorePage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full point-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-blue/10 blur-[100px] rounded-full point-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10">
                <Badge className="mb-6 bg-primary-blue/10 text-primary-blue hover:bg-primary-blue/20 border-none px-4 py-1.5 text-xs font-medium tracking-wide rounded-full">
                    Discover Hobort Auto Express
                </Badge>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
                    The modern way to <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-blue-600">source auto parts.</span>
                </h1>

                <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-12">
                    Connect directly with global suppliers, track your shipments in real-time, and manage your entire automotive supply chain from one elegant dashboard.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <Button asChild size="lg" className="h-14 px-8 rounded-full bg-primary-blue hover:bg-blue-600 text-base shadow-xl shadow-blue-500/20">
                        <Link href="/login">
                            Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-full border-slate-200 text-slate-700 hover:bg-slate-100 text-base">
                        <Link href="/marketing/guide">
                            Read the Guide
                        </Link>
                    </Button>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 text-left">
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                            <Globe className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Global Reach</h3>
                        <p className="text-slate-500 leading-relaxed">Access a worldwide network of verified part suppliers and manufacturers instantly.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
                        <p className="text-slate-500 leading-relaxed">Get quotes in minutes, not days. Our agents work around the clock to secure your parts.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
                            <ShieldCheck className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Payments</h3>
                        <p className="text-slate-500 leading-relaxed">Enterprise-grade security for all your transactions with built-in buyer protection.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
