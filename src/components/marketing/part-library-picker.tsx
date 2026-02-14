"use client"

import { useState, useMemo } from "react"
import { Search, ChevronRight, ArrowLeft, Check, PackageSearch, Wrench } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PART_LIBRARY, PartCategory, PartItem } from "@/constants/part-library"
import { motion, AnimatePresence } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface PartLibraryPickerProps {
    onSelect: (partName: string) => void
    onCustomPart: (notes: string) => void
}

export function PartLibraryPicker({ onSelect, onCustomPart }: PartLibraryPickerProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<PartCategory | null>(null)
    const [isOther, setIsOther] = useState(false)
    const [customNotes, setCustomNotes] = useState("")

    const allParts = useMemo(() => {
        return PART_LIBRARY.flatMap(cat => cat.parts.map(p => ({ ...p, categoryName: cat.name })))
    }, [])

    const filteredSearchParts = useMemo(() => {
        if (!searchQuery) return []
        return allParts.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery, allParts])

    const handlePartSelect = (part: PartItem) => {
        onSelect(part.name)
        // Reset state so the picker "closes" and returns to main grid
        setSearchQuery("")
        setSelectedCategory(null)
        setIsOther(false)
    }

    const handleCustomSubmit = () => {
        if (customNotes.trim()) {
            onCustomPart(customNotes)
            // Reset state
            setSearchQuery("")
            setSelectedCategory(null)
            setIsOther(false)
            setCustomNotes("")
        }
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            {!selectedCategory && !isOther && (
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-blue/30 group-focus-within:text-primary-orange transition-colors" />
                    <Input
                        placeholder="Search for a part (e.g. Brake Pads, Bumper...)"
                        className="h-14 pl-12 rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {/* Search Results View */}
                    {searchQuery && !selectedCategory && !isOther ? (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary-blue/40 ml-1 mb-4">Search Results</h3>
                            {filteredSearchParts.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2">
                                    {filteredSearchParts.map((part) => (
                                        <button
                                            key={part.id}
                                            type="button"
                                            onClick={() => handlePartSelect(part)}
                                            className="flex items-center justify-between p-4 rounded-xl bg-primary-blue/5 hover:bg-primary-blue hover:text-white transition-all group text-left"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{part.name}</span>
                                                <span className="text-[10px] uppercase tracking-wider opacity-60 font-bold group-hover:opacity-80 transition-opacity">{part.categoryName}</span>
                                            </div>
                                            <ChevronRight className="h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <div className="h-16 w-16 bg-primary-blue/5 rounded-3xl flex items-center justify-center">
                                        <PackageSearch className="h-8 w-8 text-primary-blue/20" />
                                    </div>
                                    <p className="text-primary-blue/60 font-medium">No specific part found for "{searchQuery}"</p>
                                    <Button
                                        variant="ghost"
                                        className="text-primary-orange font-bold uppercase tracking-widest text-[10px]"
                                        onClick={() => {
                                            setIsOther(true)
                                            setCustomNotes(searchQuery)
                                        }}
                                    >
                                        Request Custom Part Instead
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    ) : selectedCategory ? (
                        /* Category Detailed View */
                        <motion.div
                            key="category"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-primary-blue/5 h-10 w-10 shrink-0"
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    <ArrowLeft className="h-5 w-5 text-primary-blue/60" />
                                </Button>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary-blue/5 flex items-center justify-center text-primary-blue">
                                        <selectedCategory.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-primary-blue uppercase tracking-widest text-xs">{selectedCategory.name}</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {selectedCategory.parts.map((part) => (
                                    <button
                                        key={part.id}
                                        type="button"
                                        onClick={() => handlePartSelect(part)}
                                        className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl bg-white border border-primary-blue/5 hover:border-primary-orange/30 hover:shadow-xl hover:shadow-primary-orange/5 transition-all group text-left"
                                    >
                                        <span className="font-semibold text-sm md:text-base text-primary-blue">{part.name}</span>
                                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary-orange/5 text-primary-orange flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shrink-0">
                                            <Check className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                        </div>
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setIsOther(true)}
                                    className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl bg-primary-orange/5 border border-primary-orange/10 hover:bg-primary-orange hover:text-white transition-all group text-left border-dashed"
                                >
                                    <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest text-primary-orange group-hover:text-white">Other / Custom Item</span>
                                    <ChevronRight className="h-4 w-4 opacity-40 group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>
                        </motion.div>
                    ) : isOther ? (
                        /* Custom Part Manual Entry View */
                        <motion.div
                            key="custom"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-primary-blue/5 h-10 w-10"
                                    onClick={() => setIsOther(false)}
                                >
                                    <ArrowLeft className="h-5 w-5 text-primary-blue/60" />
                                </Button>
                                <h3 className="font-bold text-primary-blue uppercase tracking-widest text-xs">Custom Part Description</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-blue/40">Describe your part in detail</Label>
                                    <Textarea
                                        placeholder="e.g. Front ceramic brake pads for high performance, specific brand preference, original OEM number if known..."
                                        className="min-h-[150px] rounded-2xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white transition-all font-medium p-5"
                                        value={customNotes}
                                        onChange={(e) => setCustomNotes(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <Button
                                    className="w-full h-14 rounded-xl bg-primary-orange hover:bg-orange-600 text-white font-bold text-lg shadow-lg shadow-primary-orange/20 transition-all hover:scale-[1.01] disabled:opacity-50"
                                    onClick={handleCustomSubmit}
                                    disabled={!customNotes.trim()}
                                >
                                    Continue with This Part
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        /* Categories Grid (Initial State) */
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4"
                        >
                            {PART_LIBRARY.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(category)}
                                    className="flex flex-col items-center justify-center p-4 md:p-6 rounded-3xl bg-white border border-primary-blue/5 shadow-sm hover:border-primary-blue hover:shadow-xl hover:shadow-primary-blue/5 transition-all group"
                                >
                                    <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-primary-blue/5 text-primary-blue flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary-blue group-hover:text-white transition-all">
                                        <category.icon className="h-5 w-5 md:h-7 md:w-7" />
                                    </div>
                                    <span className="text-[9px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-widest text-primary-blue/60 group-hover:text-primary-blue transition-colors text-center leading-tight">
                                        {category.name}
                                    </span>
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setIsOther(true)}
                                className="flex flex-col items-center justify-center p-4 md:p-6 rounded-3xl bg-primary-orange/5 border border-primary-orange/10 border-dashed hover:bg-primary-orange hover:text-white transition-all group"
                            >
                                <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-white text-primary-orange flex items-center justify-center mb-3 md:mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                    <Wrench className="h-5 w-5 md:h-7 md:w-7" />
                                </div>
                                <span className="text-[9px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-widest text-center leading-tight">
                                    Other / Mixed
                                </span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
