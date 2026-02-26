"use client"

import React, { useState, useEffect } from "react"
import { Search, ShieldCheck, Truck, Star, ArrowRight, Play, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

// ... (existing imports)
import { HeroSlider } from "@/components/marketing/hero-slider"
import { TrackingWidget } from "@/components/marketing/tracking-widget"
import { FAQSection } from "@/components/marketing/faq-section"
import { GalleryPreview } from "@/components/marketing/gallery-preview"
import { Testimonials } from "@/components/marketing/testimonials"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Premium Centered Hero */}
      <HeroSlider />


      {/* Brand Logo Marquee */}
      <section className="bg-primary-blue py-8 border-y border-white/5 relative overflow-hidden pause-on-hover">
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-primary-blue to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary-blue to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden relative">
          <div className="flex animate-marquee gap-16 items-center shrink-0">
            {[
              { src: "/Car logos/toyota.png", alt: "Toyota" },
              { src: "/Car logos/Honda.png", alt: "Honda" },
              { src: "/Car logos/ford.png", alt: "Ford" },
              { src: "/Car logos/nissan.png", alt: "Nissan" },
              { src: "/Car logos/mazda.png", alt: "Mazda" },
              { src: "/Car logos/lexus.png", alt: "Lexus" },
              { src: "/Car logos/MITSUBISHI.png", alt: "Mitsubishi" },
              // duplicate for seamless loop
              { src: "/Car logos/toyota.png", alt: "Toyota" },
              { src: "/Car logos/Honda.png", alt: "Honda" },
              { src: "/Car logos/ford.png", alt: "Ford" },
              { src: "/Car logos/nissan.png", alt: "Nissan" },
              { src: "/Car logos/mazda.png", alt: "Mazda" },
              { src: "/Car logos/lexus.png", alt: "Lexus" },
              { src: "/Car logos/MITSUBISHI.png", alt: "Mitsubishi" },
            ].map((logo, i) => (
              <div
                key={i}
                className="shrink-0 flex items-center justify-center h-12 px-4 opacity-40 hover:opacity-90 transition-opacity duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-8 w-auto object-contain logo-white"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Step 2: 3-Step Intelligence Process */}
      {/* Step 2: 3-Step Intelligence Process - Mobile Optimized */}
      <section className="py-12 md:py-20 bg-white relative overflow-hidden">
        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-slate-100 -z-10" />

            {[
              { step: "01", icon: Search, title: "Identify", desc: "Scan VIN or brand to target exact specs." },
              { step: "02", icon: ShieldCheck, title: "Source", desc: "Real-time lookup across elite US hubs." },
              { step: "03", icon: Truck, title: "Deliver", desc: "Priority air or sea freight to your bay." }
            ].map((item, i) => (
              <div key={i} className="flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-6 group bg-slate-50/50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border border-slate-100/50 md:border-none shadow-sm md:shadow-none">
                <div className="relative shrink-0">
                  <div className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-2xl bg-slate-50 md:bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-blue group-hover:bg-primary-orange group-hover:text-white transition-all duration-500 shadow-sm md:group-hover:scale-110 md:group-hover:rotate-3">
                    <item.icon className="h-6 w-6 md:h-10 md:w-10" />
                  </div>
                  <div className="hidden md:flex absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white border border-slate-100 items-center justify-center text-xs font-semibold text-primary-blue shadow-sm">
                    {item.step}
                  </div>
                </div>
                <div className="flex flex-col gap-1 md:gap-2 text-left md:text-center">
                  <div className="flex items-center gap-2 md:justify-center">
                    <span className="md:hidden text-xs font-semibold text-primary-orange bg-orange-50 px-2 py-0.5 rounded-full ring-1 ring-orange-100">{item.step}</span>
                    <h3 className="text-lg md:text-xl font-semibold text-primary-blue tracking-tight uppercase">{item.title}</h3>
                  </div>
                  <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Removed WhoWeAre from here as it is now the HeroSlider */}

      {/* Gallery Preview Strip */}
      <GalleryPreview />

      {/* Centered Showcase Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1b4e6f_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
              <h2 className="text-3xl font-semibold text-primary-blue md:text-5xl tracking-tight leading-tight">
                Genuine Sourcing. <br />
                <span className="text-primary-orange">Affordable Logistics.</span>
              </h2>
              <p className="text-base md:text-lg text-slate-500 leading-relaxed max-w-md">
                Fueling the growth of Ghana's premier auto workshops and fleet owners with precision intercontinental sourcing.
              </p>
            </div>

            <div className="flex flex-col gap-8 w-full">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] md:text-xs text-slate-400 uppercase font-semibold tracking-[0.2em]">Garages Served</p>
                    <p className="text-xl font-semibold text-primary-blue">Expanding</p>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-primary-blue rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] md:text-xs text-slate-400 uppercase font-semibold tracking-[0.2em]">Parts Delivered</p>
                    <p className="text-xl font-semibold text-primary-blue">High Volume</p>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-primary-orange rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] md:text-xs text-slate-400 uppercase font-semibold tracking-[0.2em]">VIN Accuracy</p>
                    <p className="text-xl font-semibold text-primary-blue">Precise</p>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                      className="h-full bg-green-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <Testimonials />

      <FAQSection />

    </div>
  )
}
