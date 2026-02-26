"use client";

import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";
import { User, Wrench, Briefcase, Car, Truck, Anchor, Cog, PenTool, HardHat } from "lucide-react";

const testimonials = [
    {
        text: "Hobort removed all the friction from sourcing OEM parts. Their logistics team handled the containers perfectly, and our workshop has never been more efficient.",
        icon: <Wrench className="h-6 w-6" />,
        name: "Berry Brightson",
        role: "Workshop Director",
    },
    {
        text: "Finding rare engine components used to take weeks. With Hobort Auto Express, our proxy agent secured the exact spec we needed in 48 hours. Incredible service.",
        icon: <User className="h-6 w-6" />,
        name: "Ama Osei",
        role: "Independent Mechanic",
    },
    {
        text: "Their container splitting service changed how we import. We no longer have to buy full containers, which drastically improved our cash flow and inventory turnover.",
        icon: <Briefcase className="h-6 w-6" />,
        name: "Yaw Mensah",
        role: "Procurement Manager",
    },
    {
        text: "The WhatsApp integrations and live tracking mean I always know where my parts are. It's the most transparent supply chain I've experienced in the auto industry.",
        icon: <Truck className="h-6 w-6" />,
        name: "Abena Boakye",
        role: "Fleet Supervisor",
    },
    {
        text: "We bulk-order aftermarket parts every month, and the consistency in quality and delivery speed is unmatched. Hobort is now our exclusive sourcing partner.",
        icon: <Anchor className="h-6 w-6" />,
        name: "Kofi Appiah",
        role: "Import Specialist",
    },
    {
        text: "The platform's user-friendly design makes quoting and ordering seamless. Managing vehicle details and condition requirements is incredibly precise.",
        icon: <Car className="h-6 w-6" />,
        name: "Esi Ofori",
        role: "Dealership Owner",
    },
    {
        text: "What sets them apart is their quality control. Every used part we've ordered has been thoroughly inspected and arrived exactly as described.",
        icon: <Cog className="h-6 w-6" />,
        name: "Emma BBL Drizzy",
        role: "Master Technician",
    },
    {
        text: "From requesting a custom part to having it airlifted to our garage, the entire pipeline is visible. The customer support agents are also deeply knowledgeable.",
        icon: <HardHat className="h-6 w-6" />,
        name: "Akosua Nyarko",
        role: "Operations Lead",
    },
    {
        text: "Hobort's access to the US domestic market gives us a massive competitive advantage. Things we can't find locally, they find immediately.",
        icon: <PenTool className="h-6 w-6" />,
        name: "Kojo Addo",
        role: "Auto Parts Retailer",
    },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const Testimonials = () => {
    return (
        <section className="bg-slate-50 py-24 relative overflow-hidden">
            <div className="container z-10 mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center max-w-[600px] mx-auto text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="border border-[#FF7A30]/20 bg-[#FF7A30]/10 text-[#FF7A30] font-bold uppercase tracking-widest text-[10px] py-1.5 px-4 rounded-full">
                            Client Success
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#1B3B5A] mb-6">
                        Trusted by garages and importers worldwide
                    </h2>
                    <p className="text-[#1B3B5A]/70 text-lg sm:text-xl">
                        See how Hobort Auto Express is streamlining the global auto parts supply chain for businesses big and small.
                    </p>
                </motion.div>

                <div className="flex justify-center gap-6 mt-12 md:mt-16 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[500px] md:max-h-[740px] overflow-hidden">
                    <TestimonialsColumn testimonials={firstColumn} duration={25} />
                    <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={30} />
                    <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={27} />
                </div>
            </div>
        </section>
    );
};
