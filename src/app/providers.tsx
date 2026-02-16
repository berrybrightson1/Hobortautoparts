'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode } from 'react'
import { AuthProvider } from '@/components/auth/auth-provider'
import { Toaster } from 'sonner'

export default function Providers({ children, initialSession }: { children: ReactNode, initialSession: any }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // With SSR, we usually want to set some default staleTime
                        // above 0 to avoid refetching immediately on the client
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false, // Prevent refetching on window focus
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider initialSession={initialSession}>
                {children}
                <Toaster
                    position="bottom-right"
                    closeButton
                    toastOptions={{
                        classNames: {
                            toast: "group rounded-xl shadow-2xl p-4 gap-4",
                            title: "font-bold text-sm !text-white",
                            description: "text-xs font-medium !text-white/90",
                            closeButton: "!bg-white/10 !border-white/20 !text-white hover:!bg-white/20 hover:!border-white/30 transition-all [&>svg]:!text-white [&>svg]:!stroke-white",
                            actionButton: "!bg-white !text-slate-900 hover:!bg-white/90 !font-bold !shadow-lg",
                            success: "!bg-emerald-600 !border-emerald-700",
                            error: "!bg-red-600 !border-red-700",
                            info: "!bg-[#1b4e6f] !border-[#0f2d40]",
                            warning: "!bg-[#fe8323] !border-[#e6761d]"
                        }
                    }}
                />
            </AuthProvider>
        </QueryClientProvider>
    )
}
