"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, DollarSign, Target, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { VideoModal } from "@/components/marketing/video-modal";

export default function AgentBootcampPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    const handleAccept = async () => {
        setIsLoading(true);
        try {
            // Update the user's metadata in Supabase
            const { error } = await supabase.auth.updateUser({
                data: { onboarding_completed: true }
            });

            if (error) throw error;

            toast.success("Welcome aboard!", {
                description: "Your agent dashboard is now unlocked."
            });

            // Refresh the session and redirect
            router.push("/portal/agent");
            router.refresh();
        } catch (error: any) {
            toast.error("Failed to accept terms", {
                description: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const incentives = [
        {
            icon: DollarSign,
            title: "High Commissions",
            description: "Earn up to 15% on every successfully fulfilled part request you source."
        },
        {
            icon: Target,
            title: "Exclusive Leads",
            description: "Receive unassigned regional parts requests directly to your pipeline."
        },
        {
            icon: ShieldCheck,
            title: "Protected Territories",
            description: "Maintain exclusive sourcing rights within your approved regional network."
        }
    ];

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md overflow-y-auto">
            <div className="min-h-screen py-12 px-4 flex items-center justify-center w-full">
                <Card className="w-full max-w-4xl border-0 shadow-2xl shadow-primary-blue/20 bg-white overflow-hidden rounded-3xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="grid md:grid-cols-2">
                        {/* Video / Intro Section */}
                        <div className="bg-gradient-to-br from-primary-blue to-[#0f2d40] p-10 text-white flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-400 via-transparent to-transparent"></div>

                            <div className="relative z-10 space-y-6">
                                <div>
                                    <h1 className="text-3xl font-bold font-display mb-2">Agent Bootcamp</h1>
                                    <p className="text-white/70 font-medium">Your journey to becoming a premium Hobort Auto Parts Agent starts here.</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-primary-orange">Mandatory Orientation</h3>
                                    <p className="text-white/80 leading-relaxed text-sm">
                                        Before you can access the Hobort Agent Dashboard, you must review the orientation guidelines outlining our standards, workflow, and compensation structures.
                                    </p>
                                </div>

                                <div
                                    onClick={() => setIsVideoModalOpen(true)}
                                    className="group relative aspect-video bg-black/40 rounded-2xl border border-white/10 overflow-hidden cursor-pointer flex items-center justify-center transition-transform hover:scale-[1.02]"
                                >
                                    <img
                                        src="/hero img 02 (1).jpg"
                                        alt="Video Thumbnail"
                                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity"
                                    />
                                    <div className="h-16 w-16 bg-primary-orange rounded-full flex items-center justify-center relative z-10 shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform">
                                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 text-center z-10">
                                        <p className="text-sm font-bold text-white tracking-wide">Watch Orientation Video</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Incentives Section */}
                        <div className="p-10 flex flex-col h-full bg-slate-50">
                            <div className="flex-1 space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Partner Incentives & Guidelines</h2>
                                    <p className="text-slate-500 text-sm font-medium">Understand what we offer and what we expect.</p>
                                </div>

                                <div className="space-y-5">
                                    {incentives.map((item, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-100 flex items-center justify-center text-primary-orange">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{item.title}</h4>
                                                <p className="text-slate-600 text-sm leading-relaxed mt-1">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-5 bg-blue-50/50 border border-blue-100/50 rounded-2xl">
                                    <h4 className="font-bold text-primary-blue text-sm mb-2">Strict Compliance</h4>
                                    <p className="text-primary-blue/70 text-xs leading-relaxed">
                                        By proceeding, you agree to maintain Hobort's quality standards. Sourcing counterfeit parts or failing to meet SLAs will result in immediate account termination.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 mt-auto">
                                <Button
                                    onClick={handleAccept}
                                    disabled={isLoading}
                                    className="w-full h-14 text-lg font-bold rounded-xl shadow-xl shadow-primary-blue/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Activating Account...
                                        </>
                                    ) : (
                                        <>
                                            I Understand & Accept <CheckCircle2 className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-4">
                                    Unlocks full access to the Agent Portal
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <VideoModal open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen} />
        </div>
    );
}
