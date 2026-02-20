"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { RequestForm } from "@/components/marketing/request-form"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditRequestPage() {
    const { id } = useParams()
    const router = useRouter()
    const [request, setRequest] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRequest() {
            const { data, error } = await supabase
                .from('sourcing_requests')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error("Error fetching request:", error)
                router.push('/portal')
                return
            }

            if (data.status !== 'pending') {
                alert("Only pending requests can be edited.")
                router.push('/portal')
                return
            }

            setRequest(data)
            setLoading(false)
        }

        if (id) fetchRequest()
    }, [id, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary-blue" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-slate-500 hover:text-primary-blue transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Dashboard
                </Button>

                <RequestForm isEdit={true} requestId={id as string} initialData={request} />
            </div>
        </div>
    )
}
