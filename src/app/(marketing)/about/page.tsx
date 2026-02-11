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
                    <h1 className="text-5xl font-black text-primary-blue md:text-7xl tracking-tight leading-[1.1]">
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
                    <h2 className="text-4xl font-black text-white text-center mb-24 tracking-tight md:text-5xl">The 7-Step Process</h2>
                    <div className="flex flex-wrap justify-center gap-10 max-w-7xl mx-auto">
                        {STEPS.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center gap-6 p-10 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 group hover:bg-white hover:shadow-premium transition-all duration-500 w-full md:w-[calc(50%-1.25rem)] lg:w-[calc(33.33%-1.75rem)] xl:w-[calc(25%-1.75rem)] min-w-[320px]">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary-orange text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-xl group-hover:scale-110 transition-transform duration-500">
                                    {index + 1}
                                </div>
                                <h3 className="mt-6 text-2xl font-bold text-white group-hover:text-primary-blue transition-colors">{step.title}</h3>
                                <p className="text-blue-100/70 group-hover:text-slate-500 leading-relaxed transition-colors">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-slate-50/50 py-32 border-t border-slate-100">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex flex-col items-center text-center gap-16 max-w-4xl mx-auto">
                        <div className="flex flex-col gap-8 w-full">
                            <h2 className="text-4xl font-bold text-primary-blue tracking-tight">Why Choose Hobort Auto Parts Express?</h2>
                            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto w-full">
                                {[
                                    "Direct Access to US Inventory",
                                    "VIN-Validated Compatibility",
                                    "Transparent Pricing",
                                    "Expert Port Clearance Team",
                                ].map((item) => (
                                    <div key={item} className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 font-medium">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-8">
                                <Link href="/quote">
                                    <Button variant="orange" size="lg" className="rounded-full px-12 h-16 text-lg shadow-premium">Start Your First Order</Button>
                                </Link>
                            </div>
                        </div>
                        <div className="w-full aspect-video rounded-[3rem] bg-slate-100 flex items-center justify-center text-slate-400 font-medium border-4 border-white shadow-premium overflow-hidden">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-white/50 flex items-center justify-center">
                                    <div className="h-0 w-0 border-t-8 border-t-transparent border-l-12 border-l-primary-blue border-b-8 border-b-transparent ml-1" />
                                </div>
                                <span>[Hobort Auto Parts Express Logistics Center Video/Photo]</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
