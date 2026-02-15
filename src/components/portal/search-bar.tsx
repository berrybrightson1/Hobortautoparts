"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function SearchBar({ value, onChange, placeholder = "Search...", className }: SearchBarProps) {
    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-11 pr-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors text-slate-900"
            />
            {value && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
                >
                    <X className="h-4 w-4 text-slate-400" />
                </Button>
            )}
        </div>
    )
}
