"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { ShieldCheck, Zap, Truck, BadgePercent, ChevronRight, Play, CheckCircle2, Globe2, PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { TrackingWidget } from "@/components/marketing/tracking-widget"
import { cn } from "@/lib/utils"

interface Slide {
    id: number
    title: string
    description: string
    icon: React.ElementType
    image: string
    theme: string
    badge: string
}

const slides: Slide[] = [
    {
        id: 1,
        title: "Genuine U.S. auto parts delivered globally",
        description: "Access a massive inventory of authentic OEM and certified aftermarket components directly from the U.S. We bridge the gap between American quality and international demand.",
        icon: Zap,
        image: "/Hero slider white latest.jpg",
        theme: "light",
        badge: "Authorized Supply Chain"
    },
    {
        id: 2,
        title: "Precision VIN matching for every single order",
        description: "Eliminate the risk of incorrect parts with our advanced technical verification and expert matching systems. Every component is cross-referenced against your specific vehicle data.",
        icon: ShieldCheck,
        image: "/Hero slider dark.jpg",
        theme: "dark",
        badge: "Guaranteed Accuracy"
    },
    {
        id: 3,
        title: "Fast export and seamless customs clearance",
        description: "Navigate international shipping complexities with our specialized logistics team and established export hubs. We handle the documentation so your parts arrive without delay.",
        icon: Truck,
        image: "/Hero slider white new.jpg",
        theme: "light",
        badge: "Logistics Excellence"
    },
    {
        id: 4,
        title: "Premium quality at unbeatable wholesale pricing",
        description: "Leverage our direct-to-source relationships to secure the best rates on hard-to-find luxury and performance parts. Quality remains our priority while delivering significant value.",
        icon: BadgePercent,
        image: "/Hero slider white.jpg",
        theme: "light",
        badge: "Direct-to-Source Value"
    },
    {
        id: 5,
        title: "Complete tracking from our hub to your door",
        description: "Monitor every step of your shipment's journey with real-time updates and proactive delivery management. Total visibility ensures you stay informed from checkout to installation.",
        icon: PackageCheck,
        image: "/Hero slider white latest 1.jpg",
        theme: "light",
        badge: "End-to-End Visibility"
    },
]

const BRANDS = [
    { name: "summit", src: "/summit.png" },
    { name: "rockland", src: "/rockland.png" },
    { name: "autozone", src: "/autozone.png" },
    { name: "advance", src: "/advance.png" },
    { name: "autopart", src: "/autopart.png" },
    { name: "ebay", src: "/ebay.png" }
]

export function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Safety check: Reset index if it's out of bounds
    if (currentSlide >= slides.length) {
        setCurrentSlide(0)
    }

    const slideVariants: Variants = {
        enter: (direction: number) => ({
            opacity: 0,
            scale: 1.05
        }),
        center: {
            zIndex: 1,
            opacity: 1,
            scale: 1,
            transition: {
                opacity: { duration: 0.8, ease: "easeOut" },
                scale: { duration: 8, ease: "linear" }
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            opacity: 0,
            transition: {
                opacity: { duration: 0.8, ease: "easeIn" }
            }
        })
    }

    const goToSlide = (index: number) => {
        setDirection(index > currentSlide ? 1 : -1)
        setCurrentSlide(index)
    }

    const paginate = (newDirection: number) => {
        setDirection(newDirection)
        setCurrentSlide((prev) => (prev + newDirection + slides.length) % slides.length)
    }

    useEffect(() => {
        if (isPaused) return
        const timer = setInterval(() => {
            paginate(1)
        }, 8000)
        return () => clearInterval(timer)
    }, [isPaused, currentSlide])

    const current = slides[currentSlide] || slides[0]

    return (
        <section className="relative w-full min-h-[100dvh] overflow-hidden bg-slate-900 transition-colors duration-500">
            {/* Dynamic Background Image */}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none"
                    transition={{
                        opacity: { duration: 0.4 }
                    }}
                >
                    {current && current.image && (
                        <>
                            <Image
                                src={current.image}
                                alt="Hero Background"
                                fill
                                className="object-cover object-center"
                                priority
                            />
                            {/* Gradient Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-slate-900/30" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/20" />
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Static Noise Texture */}
            <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSIjMDAwIi8+Cjwvc3ZnPg==')` }}>
            </div>

            <div className="relative z-20 max-w-[1400px] mx-auto px-6 h-full grid lg:grid-cols-2 gap-12 items-center pt-32 pb-40 lg:py-0 min-h-[100dvh]">
                {/* Text Content */}
                <div className="flex flex-col justify-center space-y-8">
                    <motion.div
                        key={currentSlide + "content"}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Premium Hero Badge */}
                        <div className="relative inline-flex items-center gap-4 mb-10 group cursor-default">
                            <div className="absolute -left-4 w-2 h-[1px] bg-primary-orange/50 group-hover:w-4 group-hover:bg-primary-orange transition-all duration-500"></div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-orange shadow-[0_0_10px_rgba(254,131,35,0.8)]"></div>
                                    <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-primary-orange animate-ping opacity-40"></div>
                                </div>
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/90 drop-shadow-sm transition-colors group-hover:text-white">
                                    {current.badge}
                                </span>
                            </div>
                        </div>

                        {/* Headline */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tighter text-white drop-shadow-2xl mb-6 font-display leading-[1.1]">
                            {current.title}
                        </h1>

                        {/* Subtext */}
                        <div className="pl-6 border-l-4 border-primary-orange/50 mb-8">
                            <p className="text-base md:text-lg text-slate-300 max-w-xl font-medium leading-relaxed min-h-[4.5rem] md:min-h-[5.25rem]">
                                {current.description}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-row gap-3 md:gap-5 w-full sm:w-auto pt-4">
                            <Link href="/signup" className="flex-1 sm:flex-none">
                                <Button className="w-full h-14 md:h-16 px-6 md:px-10 rounded-full bg-primary-orange hover:bg-orange-600 text-white font-bold text-sm md:text-lg shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)] hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group whitespace-nowrap border-none">
                                    Get Started
                                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>

                            <Link href="/how-it-works" className="flex-1 sm:flex-none">
                                <Button className="w-full h-14 md:h-16 px-6 md:px-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white font-bold text-sm md:text-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap group">
                                    <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play className="w-2.5 h-2.5 ml-0.5 text-slate-900 fill-current" />
                                    </div>
                                    <span>How it Works</span>
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Tracking Widget */}
                    <div className="mt-4 md:mt-10">
                        <TrackingWidget />
                    </div>
                </div>

                {/* Right Visual (Desktop Only) */}
                <div className="hidden lg:flex relative h-full min-h-[600px] items-center justify-center pointer-events-none select-none px-10">
                    <div className="relative w-[500px] h-[500px]">
                        <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow"></div>
                        <div className="absolute inset-12 border border-white/5 rounded-full animate-spin-reverse opacity-50"></div>
                        <div className="absolute inset-24 border border-dashed border-white/10 rounded-full animate-spin-slow opacity-30"></div>

                        {/* Floating Cards */}
                        <div className="absolute top-[10%] right-[10%] bg-white/10 backdrop-blur-md border border-white/20 p-4 pr-6 rounded-2xl flex items-center gap-4 animate-bounce">
                            <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status Update</div>
                                <div className="text-sm font-bold text-white">Order #8821 Shipped</div>
                            </div>
                        </div>

                        <div className="absolute bottom-[20%] left-[0%] bg-white/10 backdrop-blur-md border border-white/20 p-4 pr-6 rounded-2xl flex items-center gap-4 animate-bounce" style={{ animationDelay: '1s' }}>
                            <div className="h-10 w-10 bg-primary-orange/20 rounded-full flex items-center justify-center text-primary-orange border border-primary-orange/20">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Transit</div>
                                <div className="text-sm font-bold text-white">Arriving in 2 Days</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rebuilt Bottom Section (Branding & Navigation) */}
            <div className="absolute bottom-0 left-0 w-full z-30 md:bg-primary-blue/5 md:backdrop-blur-sm border-t border-white/10 py-6 md:py-8">
                <div className="container max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Left side: Pagination/Progress Links (Desktop Only) */}
                    <div className="hidden md:flex gap-6 lg:gap-8 min-w-[300px]">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className="group/btn relative py-2"
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "text-[10px] font-black tracking-tighter transition-all duration-500",
                                        currentSlide === index ? "text-primary-blue scale-110" : "text-slate-400 opacity-40 group-hover/btn:opacity-100"
                                    )}>
                                        {(index + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div className={cn(
                                        "h-1 rounded-full transition-all duration-700",
                                        currentSlide === index ? "w-12 bg-primary-orange" : "w-6 bg-slate-200 group-hover/btn:bg-slate-300"
                                    )} />
                                </div>
                                <AnimatePresence>
                                    {currentSlide === index && !isPaused && (
                                        <motion.div
                                            className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-orange/30"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 8, ease: "linear" }}
                                            style={{ originX: 0 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </button>
                        ))}
                    </div>

                    {/* Right side: Premium Brand Logos with Mobile Marquee */}
                    <div className="flex items-center gap-6 w-full md:w-auto overflow-hidden">
                        <div className="hidden sm:flex flex-col items-end mr-4 shrink-0">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">Authentic</span>
                            <span className="text-xs font-bold text-white tracking-wider whitespace-nowrap">Brand Partners</span>
                        </div>

                        {/* Logo Row - Conditional Marquee on Mobile */}
                        <div className="relative flex-1 md:flex-none overflow-hidden">
                            <motion.div
                                className="flex items-center gap-4 md:gap-8"
                                animate={isMobile ? {
                                    x: [0, -1000],
                                } : {}}
                                transition={isMobile ? {
                                    x: {
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        duration: 25,
                                        ease: "linear",
                                    },
                                } : {}}
                            >
                                {/* Double the logos on mobile for seamless loop */}
                                {[...BRANDS, ...(isMobile ? BRANDS : [])].map((brand, idx) => (
                                    <div key={`${brand.name}-${idx}`} className="flex flex-col items-center group/brand relative shrink-0">
                                        <div className="h-10 md:h-12 w-20 md:w-24 relative grayscale opacity-40 group-hover/brand:grayscale-0 group-hover/brand:opacity-100 transition-all duration-500 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] p-1.5 md:p-2">
                                            <Image
                                                src={brand.src}
                                                alt={brand.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <div className="hidden md:block h-0.5 w-0 bg-primary-orange group-hover/brand:w-full transition-all duration-500 absolute -bottom-2" />
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
