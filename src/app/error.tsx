'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RotateCcw, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Unhandled Application Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Visual Element */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-red-100 rounded-2xl rotate-6 animate-pulse" />
                    <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-red-50 flex items-center justify-center">
                        <AlertTriangle className="h-12 w-12 text-red-500" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tighter text-slate-900 leading-tight">
                        Unexpected System Interruption
                    </h1>
                    <p className="text-slate-500 text-base leading-relaxed">
                        Something went wrong while processing your request. Our team has been notified and we're working to restore service.
                    </p>
                    {error.digest && (
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pt-2">
                            Error Digest: {error.digest}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="h-14 rounded-2xl bg-primary-blue hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 w-full transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <RotateCcw className="h-4 w-4" /> Try to Resume
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/" className="w-full">
                            <Button
                                variant="outline"
                                className="h-12 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 w-full font-semibold text-xs flex items-center justify-center gap-2"
                            >
                                <Home className="h-4 w-4" /> Exit to Home
                            </Button>
                        </Link>
                        <Link href="/contact" className="w-full">
                            <Button
                                variant="outline"
                                className="h-12 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 w-full font-semibold text-xs flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="h-4 w-4" /> Get Help
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Minimal Footer */}
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] pt-8">
                    Hobort Auto Express &bull; Precision Systems
                </p>
            </div>
        </div>
    )
}
