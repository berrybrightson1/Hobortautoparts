import { Construction } from "lucide-react"

export default function PlaceholderPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
            <Construction className="h-12 w-12 text-slate-300" />
            <h2 className="text-xl font-black text-primary-blue">Under Construction</h2>
            <p className="text-sm text-slate-400 max-w-xs">
                This module is currently being built. Check back soon for updates.
            </p>
        </div>
    )
}
