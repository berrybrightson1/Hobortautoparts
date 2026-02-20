"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, ArrowLeft, Images, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    galleryImages,
    CATEGORY_LABELS,
    type GalleryCategory,
} from "@/lib/gallery-images"

type FilterKey = GalleryCategory | "all"
const CATEGORIES: FilterKey[] = ["all", "new-arrivals", "client-joys", "exhibition"]

export default function GalleryPage() {
    const searchParams = useSearchParams()
    const initialCategory = (searchParams.get("category") as GalleryCategory) ?? "all"

    const [activeCategory, setActiveCategory] = useState<FilterKey>(initialCategory)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const filtered =
        activeCategory === "all"
            ? galleryImages
            : galleryImages.filter((img) => img.category === activeCategory)

    /* ── Lightbox keyboard navigation ── */
    const closeLightbox = useCallback(() => setLightboxIndex(null), [])
    const prevImage = useCallback(
        () =>
            setLightboxIndex((p) =>
                p === null ? null : (p - 1 + filtered.length) % filtered.length
            ),
        [filtered.length]
    )
    const nextImage = useCallback(
        () =>
            setLightboxIndex((p) => (p === null ? null : (p + 1) % filtered.length)),
        [filtered.length]
    )

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return
            if (e.key === "Escape") closeLightbox()
            if (e.key === "ArrowLeft") prevImage()
            if (e.key === "ArrowRight") nextImage()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [lightboxIndex, closeLightbox, prevImage, nextImage])

    // Prevent body scroll when lightbox open
    useEffect(() => {
        document.body.style.overflow = lightboxIndex !== null ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [lightboxIndex])

    return (
        <>
            <div className="min-h-screen bg-white">
                {/* ── Hero Header ── */}
                <section className="bg-primary-blue pt-20 md:pt-28 pb-10 md:pb-16 relative overflow-hidden">
                    {/* Dot grid */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:28px_28px]" />
                    </div>

                    <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium mb-8 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary-orange/20 flex items-center justify-center">
                                        <Images className="h-5 w-5 text-primary-orange" />
                                    </div>
                                    <p className="text-[10px] font-bold text-primary-orange uppercase tracking-[0.25em]">
                                        Brand Gallery
                                    </p>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                    Live from Our World
                                </h1>
                                <p className="text-white/60 text-base max-w-xl leading-relaxed">
                                    New arrivals at the warehouse, clients celebrating their deliveries, and
                                    our presence at industry exhibitions.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-white/40 text-sm font-medium shrink-0">
                                <span className="text-2xl font-bold text-white">{filtered.length}</span>
                                photo{filtered.length !== 1 ? "s" : ""}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Sticky Filter Bar ── */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
                    <div className="no-scrollbar container max-w-[1400px] mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
                        {CATEGORIES.map((cat) => {
                            const count =
                                cat === "all"
                                    ? galleryImages.length
                                    : galleryImages.filter((img) => img.category === cat).length
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 shrink-0",
                                        activeCategory === cat
                                            ? "bg-primary-blue text-white shadow-md shadow-blue-900/20"
                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    )}
                                >
                                    {CATEGORY_LABELS[cat]}
                                    <span
                                        className={cn(
                                            "h-4 min-w-4 px-1 rounded-full text-[9px] flex items-center justify-center",
                                            activeCategory === cat
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-200 text-slate-400"
                                        )}
                                    >
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* ── Image Grid ── */}
                <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 py-6 md:py-12">
                    <AnimatePresence mode="wait">
                        {filtered.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-80 gap-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50"
                            >
                                <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                    <Images className="h-8 w-8 text-slate-200" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                                        Photos coming soon
                                    </p>
                                    <p className="text-xs text-slate-300 mt-2">
                                        Add images to{" "}
                                        <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                            public/gallery/{activeCategory === "all" ? "<category>" : activeCategory}/
                                        </code>{" "}
                                        and update <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">gallery-images.ts</code>
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
                            >
                                {filtered.map((img, i) => (
                                    <motion.div
                                        key={img.src}
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.04, duration: 0.4 }}
                                        className="break-inside-avoid"
                                    >
                                        <button
                                            onClick={() => setLightboxIndex(i)}
                                            className="relative w-full rounded-2xl overflow-hidden group cursor-zoom-in shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-500 block"
                                        >
                                            <div className="relative aspect-[4/3]">
                                                <Image
                                                    src={img.src}
                                                    alt={img.alt}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </div>
                                            {/* overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="flex justify-end">
                                                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                        <ZoomIn className="h-4 w-4 text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="inline-block bg-white/20 backdrop-blur-sm text-[9px] font-bold uppercase tracking-widest text-white px-2.5 py-1 rounded-full mb-2">
                                                        {CATEGORY_LABELS[img.category]}
                                                    </span>
                                                    <p className="text-white text-xs font-semibold leading-snug line-clamp-2 text-left">
                                                        {img.alt}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Lightbox ── */}
            <AnimatePresence>
                {lightboxIndex !== null && filtered[lightboxIndex] && (
                    <motion.div
                        key="lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        {/* Close */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Counter */}
                        <div className="absolute top-5 left-5 text-white/60 text-xs font-bold uppercase tracking-widest">
                            {lightboxIndex + 1} / {filtered.length}
                        </div>

                        {/* Image */}
                        <motion.div
                            key={lightboxIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="relative max-w-5xl max-h-[80vh] w-full h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={filtered[lightboxIndex].src}
                                alt={filtered[lightboxIndex].alt}
                                fill
                                sizes="100vw"
                                className="object-contain"
                            />
                        </motion.div>

                        {/* Caption */}
                        <div className="absolute bottom-5 left-0 right-0 text-center px-6">
                            <p className="text-white/80 text-sm font-medium">
                                {filtered[lightboxIndex].alt}
                            </p>
                            <span className="inline-block mt-2 bg-white/15 text-[9px] font-bold uppercase tracking-widest text-white/60 px-2.5 py-1 rounded-full">
                                {CATEGORY_LABELS[filtered[lightboxIndex].category]}
                            </span>
                        </div>

                        {/* Prev / Next */}
                        {filtered.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage() }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all"
                                    aria-label="Previous"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage() }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all"
                                    aria-label="Next"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
