import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

const STEPS = [
    { title: "Request a Quote", description: "Submit your vehicle VIN and the parts you need through our secure form." },
    { title: "Sourcing", description: "Our US scouts find the best price and quality from authorized dealers." },
    { title: "Verification", description: "We match the part against your VIN to ensure 100% compatibility." },
    { title: "Fast Shipping", description: "Your parts are consolidated and shipped via Air or Sea freight." },
    { title: "Tracking", description: "Monitor your shipment in real-time until it arrives in Ghana." },
    { title: "Port Clearance", description: "Hobort Auto Parts Express handles all customs and clearance paperwork in Tema." },
    { title: "Delivery/Pickup", description: "Pick up from our Accra hub or have it delivered to your shop." },
]

export default function AboutPage() {
    return (
        <div className="flex flex-col gap-20 pt-40 pb-20">
            <section className="container mx-auto px-4 md:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-semibold text-primary-blue md:text-7xl tracking-tight leading-[1.1]">
                        Reliability is our <span className="text-primary-orange">Standard.</span>
                    </h1>
                    <p className="mt-8 text-xl text-slate-500 leading-relaxed mx-auto max-w-2xl">
                        Hobort Auto Parts Express was founded to bridge the gap between premium US auto parts and the Ghanaian automotive market. We understand the frustration of finding genuine parts, which is why we've built a transparent, end-to-end sourcing platform.
                    </p>
                </div>
            </section>

            <section className="bg-primary-blue py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
                </div>

                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <h2 className="text-4xl font-semibold text-white text-center mb-24 tracking-tight md:text-5xl">The 7-Step Process</h2>
                    <div className="flex flex-wrap justify-center gap-10 max-w-7xl mx-auto">
                        {STEPS.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center gap-6 p-10 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 group hover:bg-white hover:shadow-premium transition-all duration-500 w-full md:w-[calc(50%-1.25rem)] lg:w-[calc(33.33%-1.75rem)] xl:w-[calc(25%-1.75rem)] min-w-[320px]">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary-orange text-white rounded-2xl flex items-center justify-center text-xl font-semibold shadow-xl group-hover:scale-110 transition-transform duration-500">
                                    {index + 1}
                                </div>
                                <h3 className="mt-6 text-2xl font-medium text-white group-hover:text-primary-blue transition-colors">{step.title}</h3>
                                <p className="text-blue-100/70 group-hover:text-slate-500 leading-relaxed transition-colors">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-slate-50/50 py-32 border-t border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#0c4a6e_1px,transparent_1px)] [background-size:24px_24px]" />
                </div>

                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <div className="flex flex-col items-center gap-16 max-w-5xl mx-auto">
                        <div className="flex flex-col gap-8 w-full text-center">
                            <h2 className="text-4xl font-semibold text-primary-blue tracking-tight md:text-5xl">Value Highlights</h2>
                            <p className="text-slate-500 max-w-xl mx-auto font-medium">
                                We combine intercontinental scale with local precision to deliver an automotive sourcing experience that's fast, secure, and cost-effective.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                                {[
                                    { title: "Genuine Quality", desc: "Official OEM & high-quality used parts from authorized scouts.", icon: CheckCircle2 },
                                    { title: "VIN Matching", desc: "Advanced verification ensures 100% compatibility every time.", icon: CheckCircle2 },
                                    { title: "Express Logistics", desc: "Swift air & sea freight with door-to-hub tracking reliability.", icon: CheckCircle2 },
                                    { title: "Major Savings", desc: "Direct sourcing reduces costs by up to 25% for our clients.", icon: CheckCircle2 },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-premium hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center gap-4 group"
                                    >
                                        <div className="h-12 w-12 rounded-2xl bg-primary-blue/5 text-primary-orange flex items-center justify-center group-hover:bg-primary-orange group-hover:text-white transition-all duration-500">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-lg font-semibold text-primary-blue">{item.title}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8">
                                <Link href="/quote">
                                    <Button variant="orange" size="lg" className="rounded-full px-12 h-16 text-lg shadow-premium hover:scale-105 transition-transform">Start Your First Order</Button>
                                </Link>
                            </div>
                        </div>

                        <div className="w-full aspect-video rounded-[3rem] bg-slate-900 flex items-center justify-center text-slate-400 font-medium border-[12px] border-white shadow-premium overflow-hidden relative group">
                            <div className="absolute inset-0 bg-primary-blue/20 group-hover:bg-transparent transition-colors duration-700" />
                            <div className="flex flex-col items-center gap-4 relative z-10">
                                <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all cursor-pointer group/play">
                                    <div className="h-0 w-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                                </div>
                                <span className="text-white/80 text-sm font-semibold tracking-widest uppercase">Watch Logistics Center Overview</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
