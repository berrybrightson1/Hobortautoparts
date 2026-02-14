import { SERVICES } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import * as LucideIcons from "lucide-react"

export default function ServicesPage() {
    return (
        <div className="flex flex-col gap-20 pt-40 pb-20">
            <section className="container max-w-[1400px] mx-auto px-6 text-center pb-12">
                <div className="max-w-4xl mx-auto flex flex-col gap-8">
                    <h1 className="text-5xl font-semibold text-primary-blue md:text-7xl tracking-tight leading-[1.1]">Our Sourcing Services</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        From single sensors to complete engines, Hobort Auto Parts Express handles the complexity of international sourcing so you can focus on the repair.
                    </p>
                </div>
            </section>

            <section className="container max-w-[1400px] mx-auto px-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {SERVICES.map((service, index) => {
                        // @ts-ignore - dynamic icon access for wireframe
                        const Icon = LucideIcons[service.icon] || LucideIcons.Tool
                        return (
                            <div
                                key={index}
                                className="group p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-premium transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center gap-5"
                            >
                                <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-blue transition-all duration-500 group-hover:bg-primary-orange group-hover:text-white group-hover:scale-110 shadow-sm">
                                    <Icon className="h-8 w-8" />
                                </div>
                                <div className="flex flex-col gap-2 relative z-10">
                                    <h3 className="text-2xl font-semibold text-primary-blue tracking-tight leading-tight">{service.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{service.description}</p>
                                </div>
                                <div className="mt-2 relative z-10">
                                    <Link href="/quote">
                                        <Button
                                            variant="link"
                                            className="p-0 text-primary-orange font-medium text-base group-hover:gap-2 transition-all flex items-center gap-1"
                                        >
                                            Inquire about this
                                            <LucideIcons.ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            <section className="container max-w-[1400px] mx-auto px-6 pb-32">
                <div className="rounded-[2.5rem] md:rounded-[4rem] bg-[#0c1425] p-10 md:p-24 overflow-hidden relative shadow-premium text-center flex flex-col items-center border border-white/5">
                    <div className="relative z-10 flex flex-col items-center gap-8 md:gap-12 max-w-2xl mx-auto">
                        <div className="text-white space-y-4 md:space-y-6">
                            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.85] text-balance">Join the Global <span className="text-primary-orange">Sourcing</span> Network</h2>
                            <p className="text-base md:text-xl text-blue-100/70 leading-relaxed font-medium max-w-xl mx-auto text-balance">
                                Bridge the gap between international suppliers and local markets. Join our network of professional agents and power the future of auto parts logistics.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Link href="/register/agent" className="w-full sm:w-auto">
                                <Button className="rounded-2xl md:rounded-full px-12 h-14 md:h-20 text-base md:text-xl font-black shadow-2xl hover:scale-105 transition-all text-white w-full sm:w-auto uppercase tracking-widest bg-primary-orange hover:bg-orange-600 border-0">
                                    Launch Agent Partnership
                                </Button>
                            </Link>
                            <Link href="/contact" className="w-full sm:w-auto">
                                <Button variant="outline" className="rounded-2xl md:rounded-full px-12 h-14 md:h-20 text-base md:text-xl font-black transition-all hover:bg-white/10 text-white border-white/20 w-full sm:w-auto uppercase tracking-widest bg-transparent">
                                    Contact Support
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_2px,transparent_1px)] [background-size:48px_48px]" />
                    </div>
                </div>
            </section>
        </div>
    )
}
