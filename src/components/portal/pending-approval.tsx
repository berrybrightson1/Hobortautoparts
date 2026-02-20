"use client"

import { ShieldCheck, Clock, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PendingApproval() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="max-w-lg w-full shadow-2xl border-0 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-1">
                    <div className="bg-white rounded-t-[1.4rem]">
                        <CardContent className="pt-10 pb-8 px-6 text-center space-y-5">
                            {/* Icon */}
                            <div className="relative inline-flex">
                                <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full"></div>
                                <div className="relative h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border-4 border-white shadow-xl">
                                    <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
                                </div>
                            </div>

                            {/* Heading */}
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-slate-900">
                                    Application Under Review
                                </h1>
                                <p className="text-sm text-slate-600 max-w-md mx-auto">
                                    Thank you for applying to become a partner agent! Your application is currently being reviewed by our admin team.
                                </p>
                            </div>

                            {/* Status Info */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 space-y-3 border border-slate-200">
                                <div className="flex items-start gap-3 text-left">
                                    <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-sm mb-0.5">What happens next?</h3>
                                        <p className="text-xs text-slate-600">
                                            Our team will review your application within 24-48 hours. Once approved, you'll receive an email notification and gain full access to the partner portal.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-left">
                                    <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-sm mb-0.5">Stay updated</h3>
                                        <p className="text-xs text-slate-600">
                                            Check your email regularly for approval notifications. Make sure to check your spam folder as well.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                                <Link href="/">
                                    <Button variant="outline" className="rounded-xl px-6 h-10 text-sm border-slate-300 hover:bg-slate-50">
                                        Return to Homepage
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button className="rounded-xl px-6 h-10 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/30">
                                        Contact Support
                                    </Button>
                                </Link>
                            </div>

                            {/* Footer Note */}
                            <p className="text-xs text-slate-500 pt-2">
                                Questions? Email{" "}
                                <a href="mailto:info@hobortautopartsexpress.com" className="text-amber-600 hover:text-amber-700 font-medium">
                                    info@hobortautopartsexpress.com
                                </a>
                            </p>
                        </CardContent>
                    </div>
                </div>
            </Card>
        </div>
    )
}
