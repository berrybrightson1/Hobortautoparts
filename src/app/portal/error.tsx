'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Portal Error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
            <div className="h-20 w-20 bg-red-50 rounded-2xl flex items-center justify-center shadow-sm border border-red-100">
                <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Something went wrong</h2>
                <p className="text-slate-500 font-normal">
                    We encountered an unexpected error while loading this section.
                    {error.message && <span className="block mt-2 text-xs font-mono bg-slate-50 p-2 rounded border border-slate-100">{error.message}</span>}
                </p>
            </div>
            <div className="flex gap-4">
                <Button
                    onClick={() => window.location.href = '/portal/customer'}
                    variant="outline"
                    className="rounded-xl h-12 px-6 font-semibold border-slate-200 hover:bg-slate-50"
                >
                    Return Home
                </Button>
                <Button
                    onClick={reset}
                    className="rounded-xl h-12 px-6 font-semibold bg-primary-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                >
                    <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
            </div>
        </div>
    )
}
