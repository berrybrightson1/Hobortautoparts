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
                    richColors
                    expand={true}
                    closeButton
                    toastOptions={{
                        style: {
                            borderRadius: '12px',
                            border: '1px solid rgba(0,0,0,0.05)',
                        },
                        classNames: {
                            toast: "group shadow-2xl p-4",
                            title: "font-bold text-sm",
                            description: "text-xs font-medium opacity-80",
                            actionButton: "bg-slate-900 text-white font-bold",
                        }
                    }}
                />
            </AuthProvider>
        </QueryClientProvider>
    )
}
