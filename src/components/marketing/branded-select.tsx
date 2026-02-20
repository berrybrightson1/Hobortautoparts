"use client"

import * as React from "react"
import { createPortal } from "react-dom"
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
    const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Compute dropdown position from the button's bounding rect
    const openDropdown = () => {
        if (disabled || !buttonRef.current) return
        const rect = buttonRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        const dropdownHeight = 240

        if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
            // Open downward
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            })
        } else {
            // Open upward
            setDropdownStyle({
                position: "fixed",
                bottom: window.innerHeight - rect.top + 8,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            })
        }
        setIsOpen(true)
    }

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (
                containerRef.current && !containerRef.current.contains(target)
            ) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    // Close on scroll/resize — but NOT when scrolling inside the dropdown list itself
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => {
        const close = (e: Event) => {
            if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) return
            setIsOpen(false)
        }
        if (isOpen) {
            window.addEventListener("scroll", close, true)
            window.addEventListener("resize", close)
        }
        return () => {
            window.removeEventListener("scroll", close, true)
            window.removeEventListener("resize", close)
        }
    }, [isOpen])

    const displayOptions = React.useMemo(() => {
        if (value && !options.includes(value)) {
            return [value, ...options]
        }
        return options
    }, [value, options])

    const dropdown = isOpen ? (
        <div
            ref={dropdownRef}
            style={dropdownStyle} // eslint-disable-line react/forbid-component-props
            className="bg-white border border-primary-blue/10 rounded-2xl shadow-2xl shadow-primary-blue/10 p-2 animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                {displayOptions.length > 0 ? (
                    displayOptions.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault() // prevent blur before click registers
                                onChange(option)
                                setIsOpen(false)
                            }}
                            className={cn(
                                "flex items-center justify-between w-full px-5 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all",
                                value === option
                                    ? "bg-primary-blue text-white shadow-lg shadow-primary-blue/20"
                                    : "text-primary-blue/70 hover:bg-primary-blue/5 hover:text-primary-blue"
                            )}
                        >
                            {option}
                            {value === option && <Check className="h-4 w-4" />}
                        </button>
                    ))
                ) : (
                    <div className="px-4 py-3 text-[10px] font-medium text-primary-blue/30 uppercase tracking-widest text-center">
                        No options available
                    </div>
                )}
            </div>
        </div>
    ) : null

    return (
        <div className={cn("space-y-1.5 relative", className)} ref={containerRef}>
            <label className="ml-1 text-[10px] font-medium text-primary-blue/80 uppercase">{label}</label>
            <button
                ref={buttonRef}
                type="button"
                onClick={isOpen ? () => setIsOpen(false) : openDropdown}
                className={cn(
                    "flex items-center justify-between w-full h-12 px-4 rounded-xl border-2 transition-all text-left",
                    isOpen ? "bg-white border-slate-900 ring-0" : "bg-primary-blue/5 border-transparent hover:bg-primary-blue/10",
                    disabled && "opacity-50 cursor-not-allowed",
                    value ? "text-primary-blue font-semibold uppercase" : "text-primary-blue/40 font-medium"
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    <span>{value || placeholder}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-primary-blue/30 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {/* Render dropdown via portal so it's never clipped by overflow:hidden ancestors */}
            {typeof document !== "undefined" && dropdown && createPortal(dropdown, document.body)}
        </div>
    )
}
