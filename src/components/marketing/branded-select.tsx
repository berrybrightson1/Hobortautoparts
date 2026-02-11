"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface BrandedSelectProps {
    label: string
    value: string
    options: string[]
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function BrandedSelect({
    label,
    value,
    options,
    onChange,
    placeholder = "Select...",
    disabled = false,
    className
}: BrandedSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const displayOptions = React.useMemo(() => {
        if (value && !options.includes(value)) {
            return [value, ...options]
        }
        return options
    }, [value, options])

    return (
        <div className={cn("space-y-2.5 relative", className)} ref={containerRef}>
            <label className="ml-1 text-[10px] font-semibold text-primary-blue/80 uppercase tracking-widest">{label}</label>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full h-14 px-5 rounded-2xl border-primary-blue/10 bg-primary-blue/5 transition-all text-left",
                    isOpen ? "bg-white border-primary-blue/20 ring-4 ring-primary-blue/5" : "hover:bg-primary-blue/10",
                    disabled && "opacity-50 cursor-not-allowed",
                    value ? "text-primary-blue font-medium" : "text-primary-blue/40 font-medium"
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    <span>{value || placeholder}</span>
                    {value && options.includes(value) === false && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary-blue text-white font-medium animate-pulse">DETECTED</span>
                    )}
                </div>
                <ChevronDown className={cn("h-4 w-4 text-primary-blue/30 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-primary-blue/10 rounded-2xl shadow-2xl shadow-primary-blue/10 p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                        {displayOptions.length > 0 ? (
                            displayOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        onChange(option)
                                        setIsOpen(false)
                                    }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-medium uppercase tracking-tight transition-all",
                                        value === option
                                            ? "bg-primary-blue text-white"
                                            : "text-primary-blue/60 hover:bg-primary-blue/5 hover:text-primary-blue"
                                    )}
                                >
                                    {option}
                                    {value === option && <Check className="h-3.5 w-3.5" />}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-[10px] font-medium text-primary-blue/30 uppercase tracking-widest text-center">
                                No options available
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
