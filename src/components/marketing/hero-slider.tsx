"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, Zap, Truck, BadgePercent, ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { TrackingWidget } from "@/components/marketing/tracking-widget"
import { cn } from "@/lib/utils"

const slides = [
    {
        id: 1,
        title: "Direct from Source",
        description: "We deliver authentic OEM and high-quality used parts straight from trusted U.S. suppliers—ensuring reliability, quality, and true value.",
        icon: Zap,
        image: "/Hero slider white latest.jpg",
        theme: "light" // Light background, Dark text
    },
    {
        id: 2,
        title: "Quality Guaranteed",
        description: "Every part is carefully checked and matched to your VIN to ensure the correct fit and dependable performance.",
        icon: ShieldCheck,
        image: "/Hero slider dark.jpg",
        theme: "dark" // Dark background, Light text
    },
    {
        id: 3,
        title: "Logistics Expertise",
        description: "From our Atlanta export hubs to Tema port clearance, we manage the full journey through secure air and sea freight—fast, safe, and efficient.",
        icon: Truck,
        image: "/Hero slider white latest.jpg",
        theme: "light"
    },
    {
        id: 4,
        title: "Real Savings",
        description: "By sourcing directly and streamlining delivery, we pass up to 25% savings straight to you without compromising quality.",
        icon: BadgePercent,
        image: "/Hero slider dark.jpg",
        theme: "dark"
    },
]

export function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [direction, setDirection] = useState(0)

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    }

    const paginate = (newDirection: number) => {
        setDirection(newDirection)
        setCurrentSlide((prev) => (prev + newDirection + slides.length) % slides.length)
    }

    useEffect(() => {
        const timer = setInterval(() => {
            paginate(1)
        }, 6000)
        return () => clearInterval(timer)
    }, [])

    const current = slides[currentSlide]
    const isDarkTheme = current.theme === 'dark'

    return (
        <section className={cn(
            "relative h-[600px] lg:h-auto lg:aspect-[1920/800] w-full overflow-hidden transition-colors duration-500",
            isDarkTheme ? "bg-slate-900" : "bg-white"
        )}>
            {/* Dynamic Background Image */}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.5 }
                    }}
                    className="absolute inset-0 w-full h-full z-0 flex items-center justify-center"
                >
                    <Image
                        src={current.image}
                        alt="Hero Background"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-20 container max-w-[1400px] mx-auto px-6 h-full flex flex-col justify-center">
                <div className="max-w-3xl text-left mt-16 md:mt-0">
                    <motion.div
                        key={currentSlide + "content"}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border text-xs font-semibold uppercase tracking-[0.2em] mb-6 transition-colors duration-300",
                            isDarkTheme
                                ? "bg-white/10 border-white/20 text-white"
                                : "bg-slate-100/80 border-slate-200 text-primary-blue"
                        )}>
                            <current.icon className={cn("h-3 w-3", isDarkTheme ? "text-white" : "text-primary-orange")} />
                            {current.title === "Direct from Source" ? "Genuine Parts" : "Hobort Auto Express"}
                        </div>

                        <h1 className={cn(
                            "text-4xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] transition-colors duration-300",
                            isDarkTheme ? "text-white" : "text-primary-blue"
                        )}>
                            {current.title}
                        </h1>

                        <p className={cn(
                            "text-lg md:text-2xl leading-relaxed font-light max-w-2xl transition-colors duration-300",
                            isDarkTheme ? "text-slate-200" : "text-slate-600"
                        )}>
                            {current.description}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <Link href="/signup">
                                <Button size="lg" className="rounded-full px-8 text-lg bg-primary-orange hover:bg-orange-600 text-white border-none shadow-premium hover:shadow-orange-500/20 w-full sm:w-auto">
                                    Get Started
                                </Button>
                            </Link>
                            <Link href="/how-it-works">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className={cn(
                                        "rounded-full px-8 text-lg hover:text-primary-orange transition-colors duration-300 w-full sm:w-auto",
                                        isDarkTheme
                                            ? "text-white border-white/30 hover:bg-white/10"
                                            : "text-primary-blue border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    <Play className={cn("mr-2 h-4 w-4", isDarkTheme ? "fill-white" : "fill-primary-blue")} />
                                    How it Works
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Static Tracking Widget */}
                    <div className="mt-8 md:mt-10">
                        <TrackingWidget className="px-0" />
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="absolute bottom-12 left-4 md:left-auto md:right-32 flex gap-4 z-30">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => paginate(-1)}
                        className={cn(
                            "rounded-full backdrop-blur-sm shadow-sm transition-colors duration-300 hover:text-primary-blue",
                            isDarkTheme
                                ? "bg-white/10 text-white hover:bg-white/20 border-white/10"
                                : "bg-white/80 text-slate-600 hover:bg-white border-slate-200"
                        )}
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => paginate(1)}
                        className={cn(
                            "rounded-full backdrop-blur-sm shadow-sm transition-colors duration-300 hover:text-primary-blue",
                            isDarkTheme
                                ? "bg-white/10 text-white hover:bg-white/20 border-white/10"
                                : "bg-white/80 text-slate-600 hover:bg-white border-slate-200"
                        )}
                    >
                        <ChevronRight className="h-8 w-8" />
                    </Button>
                </div>

                {/* Pagination Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                    {slides.map((slide, index) => {
                        const isActive = index === currentSlide
                        return (
                            <div
                                key={slide.id}
                                onClick={() => {
                                    setDirection(index > currentSlide ? 1 : -1)
                                    setCurrentSlide(index)
                                }}
                                className={cn(
                                    "h-2 rounded-full cursor-pointer transition-all duration-300",
                                    isActive ? "w-8 bg-primary-orange" : "w-2",
                                    !isActive && (isDarkTheme ? "bg-white/30 hover:bg-white/50" : "bg-slate-300 hover:bg-slate-400")
                                )}
                            />
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
