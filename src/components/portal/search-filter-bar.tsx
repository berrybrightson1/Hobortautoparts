"use client"

import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SearchFilterBarProps {
    onSearch: (term: string) => void
    onFilter: (status: string) => void
    currentFilter: string
    filterOptions: string[]
    placeholder?: string
}

export function SearchFilterBar({
    onSearch,
    onFilter,
    currentFilter,
    filterOptions,
    placeholder = "Search..."
}: SearchFilterBarProps) {
    return (
        <div className="flex gap-2 w-full max-w-xl">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder={placeholder}
                    className="pl-9 bg-white border-slate-200 rounded-xl focus-visible:ring-primary-blue"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 rounded-xl border-slate-200 bg-white text-slate-600 hover:text-primary-blue">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline-block">{currentFilter === 'all' ? 'Filter' : currentFilter}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => onFilter('all')}>All</DropdownMenuItem>
                    {filterOptions.map(option => (
                        <DropdownMenuItem key={option} onClick={() => onFilter(option)}>
                            {option}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
