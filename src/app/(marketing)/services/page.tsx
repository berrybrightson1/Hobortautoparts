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
                <div className="rounded-[4rem] bg-primary-blue p-16 md:p-24 overflow-hidden relative shadow-premium text-center flex flex-col items-center">
                    <div className="relative z-10 flex flex-col items-center gap-10 max-w-2xl mx-auto">
                        <div className="text-white">
                            <h2 className="text-4xl font-semibold mb-6 tracking-tight md:text-5xl">Partner Network Onboarding</h2>
                            <p className="text-xl text-blue-100/80 leading-relaxed font-medium">
                                Running a transportation company or looking to join our logistics network? Choose your path below to get started.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link href="/register/fleet">
                                <Button variant="orange" size="lg" className="rounded-full px-12 h-16 text-lg font-medium shadow-premium hover:scale-105 transition-transform bg-white text-primary-blue hover:bg-slate-50">
                                    Register Fleet Account
                                </Button>
                            </Link>
                            <Link href="/register/agent">
                                <Button variant="orange" size="lg" className="rounded-full px-12 h-16 text-lg font-medium shadow-premium hover:scale-105 transition-transform text-white">
                                    Join Agent Network
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_2px,transparent_1px)] [background-size:64px_64px]" />
                    </div>
                </div>
            </section>
        </div>
    )
}
