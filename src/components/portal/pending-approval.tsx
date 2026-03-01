"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, Clock, Mail, X, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function PendingApprovalModal() {
    const [isOpen, setIsOpen] = useState(false) // start false â€” only open once we confirm still pending

    useEffect(() => {
        // Verify directly from the DB â€” do NOT trust stale React context.
        // If admin has already approved this account, close immediately.
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role === 'pending_agent') {
                setIsOpen(true) // Still pending â€” show the modal
            }
            // Otherwise: role is 'agent' or 'customer' â€” leave isOpen=false, modal never shows
        }

        checkRole()

        // Also subscribe to live role changes so the modal auto-closes the moment admin approves
        let channel: ReturnType<typeof supabase.channel> | null = null

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return
            channel = supabase
                .channel(`pending_modal_watch:${user.id}`)
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
                    (payload) => {
                        if (payload.new?.role !== 'pending_agent') {
                            setIsOpen(false) // Approved or declined â€” dismiss modal live
                        }
                    }
                )
                .subscribe()
        })

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-white text-slate-900 border-0 shadow-2xl rounded-2xl"
            >
                {/* Decorative Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-xl">
                            <Clock className="h-8 w-8 text-white animate-pulse" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                                Application Under Review
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-sm text-slate-600 text-center">
                        Thank you for applying to become a partner agent! Your application is currently being reviewed by our admin team.
                    </p>

                    {/* Status Info */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wider">What happens next?</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Our team will review your application within 24-48 hours. Once approved, you'll receive an email notification and gain full access to the partner portal.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wider">Stay updated</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Check your email regularly for approval notifications. While you wait, you can still use the customer portal to track personal requests.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            onClick={() => setIsOpen(false)}
                            className="w-full rounded-xl h-11 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/30 font-bold tracking-wide"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Got It, Close Window
                        </Button>
                    </div>

                    {/* Footer Note */}
                    <p className="text-xs text-center text-slate-500">
                        Questions? Email{" "}
                        <a href="mailto:info@hobortautopartsexpress.com" className="text-amber-600 hover:text-amber-700 font-bold">
                            info@hobortautopartsexpress.com
                        </a>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

