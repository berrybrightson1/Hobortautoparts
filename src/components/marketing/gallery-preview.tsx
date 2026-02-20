"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight, Images } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    galleryImages,
    CATEGORY_LABELS,
    type GalleryCategory,
} from "@/lib/gallery-images"

type FilterKey = GalleryCategory | "all"

const CATEGORIES: FilterKey[] = ["all", "new-arrivals", "client-joys", "exhibition"]

export function GalleryPreview() {
    const [activeCategory, setActiveCategory] = useState<FilterKey>("all")
    const [currentIndex, setCurrentIndex] = useState(0)
    const trackRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)

    const filtered = activeCategory === "all"
        ? galleryImages
        : galleryImages.filter((img) => img.category === activeCategory)

    // Reset slider position when category changes
    useEffect(() => {
        setCurrentIndex(0)
        if (trackRef.current) trackRef.current.scrollLeft = 0
    }, [activeCategory])

    // Auto-advance every 4 s
    useEffect(() => {
        if (filtered.length === 0) return
        const id = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % filtered.length)
        }, 4000)
        return () => clearInterval(id)
    }, [filtered.length, activeCategory])

    // Scroll track to center currentIndex in the visible area
    useEffect(() => {
        const track = trackRef.current
        if (!track || filtered.length === 0) return
        const card = track.children[currentIndex] as HTMLElement | undefined
        if (!card) return
        const trackWidth = track.offsetWidth
        const cardLeft = card.offsetLeft
        const cardWidth = card.offsetWidth
        // Scroll so the card center aligns with the track center
        const targetScrollLeft = cardLeft - trackWidth / 2 + cardWidth / 2
        track.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: "smooth" })
    }, [currentIndex, filtered.length])

    /* ── Drag to scroll ── */
    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true
        startX.current = e.pageX - (trackRef.current?.offsetLeft ?? 0)
        scrollLeft.current = trackRef.current?.scrollLeft ?? 0
    }
    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !trackRef.current) return
        e.preventDefault()
        const x = e.pageX - trackRef.current.offsetLeft
        trackRef.current.scrollLeft = scrollLeft.current - (x - startX.current)
    }
    const stopDrag = () => { isDragging.current = false }

    const prev = useCallback(() => setCurrentIndex((p) => (p - 1 + filtered.length) % filtered.length), [filtered.length])
    const next = useCallback(() => setCurrentIndex((p) => (p + 1) % filtered.length), [filtered.length])

    return (
        <section className="py-16 md:py-24 bg-white overflow-hidden">
            <div className="container max-w-[1400px] mx-auto px-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-primary-orange uppercase tracking-[0.25em]">
                            Behind the Operation
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-semibold text-primary-blue tracking-tight leading-tight">
                            Live from Our World
                        </h2>
                        <p className="text-sm text-slate-500 font-medium max-w-md leading-relaxed">
                            New arrivals at the warehouse, clients celebrating their deliveries, and our
                            presence at industry events.
                        </p>
                    </div>
                    <Link
                        href="/gallery"
                        className="group flex items-center gap-2 text-sm font-bold text-primary-blue hover:text-primary-orange transition-colors shrink-0"
                    >
                        View Full Gallery
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* ── Category Pills ── */}
                <div className="flex gap-2 flex-wrap mb-8">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300",
                                activeCategory === cat
                                    ? "bg-primary-blue text-white shadow-md shadow-blue-900/20"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            )}
                        >
                            {CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>

                {/* ── Image Strip or Empty State ── */}
                <AnimatePresence mode="wait">
                    {filtered.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-64 gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50"
                        >
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Images className="h-7 w-7 text-slate-300" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Photos coming soon
                                </p>
                                <p className="text-[11px] text-slate-300 mt-1">
                                    Drop images into{" "}
                                    <code className="font-mono bg-slate-100 px-1 rounded">
                                        public/gallery/{activeCategory === "all" ? "<category>" : activeCategory}/
                                    </code>
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="relative"
                        >
                            {/* Scroll track — overflow-y-visible so ring/shadow don't clip */}
                            <div
                                ref={trackRef}
                                onMouseDown={onMouseDown}
                                onMouseMove={onMouseMove}
                                onMouseUp={stopDrag}
                                onMouseLeave={stopDrag}
                                className="no-scrollbar flex gap-4 overflow-x-auto overflow-y-visible scroll-smooth py-3 select-none"
                            >
                                {filtered.map((img, i) => (
                                    <Link
                                        key={img.src}
                                        href={`/gallery?category=${img.category}`}
                                        className={cn(
                                            "relative shrink-0 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500",
                                            // Same width for all cards — focus is shown via scale + height
                                            "w-56 md:w-72",
                                            i === currentIndex
                                                ? "h-64 md:h-80 ring-2 ring-primary-orange ring-offset-2 scale-[1.04] shadow-2xl shadow-primary-orange/20 z-10"
                                                : "h-52 md:h-64 opacity-75 hover:opacity-95"
                                        )}
                                        style={{ transformOrigin: "center bottom" }}
                                        onClick={(e) => {
                                            if (isDragging.current) e.preventDefault()
                                            setCurrentIndex(i)
                                        }}
                                    >
                                        <Image
                                            src={img.src}
                                            alt={img.alt}
                                            fill
                                            sizes="(max-width: 768px) 224px, 288px"
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            draggable={false}
                                        />
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        {/* Category badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/90 backdrop-blur-sm text-[9px] font-bold uppercase tracking-widest text-primary-blue px-2.5 py-1 rounded-full">
                                                {CATEGORY_LABELS[img.category]}
                                            </span>
                                        </div>
                                        {/* Alt text on hover */}
                                        <p className="absolute bottom-3 left-3 right-3 text-[11px] font-semibold text-white leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                                            {img.alt}
                                        </p>
                                    </Link>
                                ))}
                            </div>

                            {/* Prev / Next arrows — hidden on mobile (touch-swipe works) */}
                            {filtered.length > 1 && (
                                <>
                                    <button
                                        onClick={prev}
                                        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 h-10 w-10 rounded-full bg-white border border-slate-200 shadow-lg shadow-slate-200/60 items-center justify-center hover:bg-primary-blue hover:text-white hover:border-primary-blue transition-all duration-300 z-10"
                                        aria-label="Previous photo"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={next}
                                        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 h-10 w-10 rounded-full bg-white border border-slate-200 shadow-lg shadow-slate-200/60 items-center justify-center hover:bg-primary-blue hover:text-white hover:border-primary-blue transition-all duration-300 z-10"
                                        aria-label="Next photo"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}

                            {/* Dot indicators */}
                            <div className="flex justify-center gap-1.5 mt-6">
                                {filtered.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        aria-label={`Go to photo ${i + 1}`}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-500",
                                            i === currentIndex
                                                ? "bg-primary-orange w-8"
                                                : "bg-slate-200 w-1.5 hover:bg-slate-300"
                                        )}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── "See all" CTA ── */}
                <div className="mt-8 md:mt-10 flex justify-center">
                    <Link
                        href="/gallery"
                        className="group inline-flex items-center gap-2 md:gap-3 bg-primary-blue hover:bg-primary-orange text-white px-6 md:px-8 py-3 md:py-3.5 rounded-full font-semibold text-xs md:text-sm tracking-wide transition-all duration-300 shadow-lg shadow-blue-900/20 hover:shadow-orange-400/30 hover:scale-105"
                    >
                        <Images className="h-4 w-4" />
                        Explore the Full Gallery
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
