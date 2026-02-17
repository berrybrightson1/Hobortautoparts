"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTutorial } from "./tutorial-context"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function PortalTour() {
    const { isActive, currentStep, steps, nextStep, prevStep, endTour } = useTutorial()
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const [mounted, setMounted] = useState(false)
    const step = steps[currentStep]

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!isActive || !step) return

        const updateRect = () => {
            const element = document.querySelector(step.target)
            if (element) {
                setTargetRect(element.getBoundingClientRect())
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }

        updateRect()
        window.addEventListener('resize', updateRect)
        window.addEventListener('scroll', updateRect)

        return () => {
            window.removeEventListener('resize', updateRect)
            window.removeEventListener('scroll', updateRect)
        }
    }, [isActive, currentStep, step])

    if (!mounted || !isActive || !step || !targetRect) return null

    return (
        <div className="fixed inset-0 z-[99999] pointer-events-none">
            {/* Spotlight Mask */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] pointer-events-auto"
                style={{
                    clipPath: `polygon(
                        0% 0%, 
                        0% 100%, 
                        ${targetRect.left - 8}px 100%, 
                        ${targetRect.left - 8}px ${targetRect.top - 8}px, 
                        ${targetRect.right + 8}px ${targetRect.top - 8}px, 
                        ${targetRect.right + 8}px ${targetRect.bottom + 8}px, 
                        ${targetRect.left - 8}px ${targetRect.bottom + 8}px, 
                        ${targetRect.left - 8}px 100%, 
                        100% 100%, 
                        100% 0%
                    )`
                }}
                onClick={endTour}
            />

            {/* Tooltip */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    x: step.position === 'right' ? targetRect.right + 24 :
                        step.position === 'left' ? targetRect.left - 344 :
                            targetRect.left,
                    top: step.position === 'bottom' ? targetRect.bottom + 24 :
                        step.position === 'top' ? targetRect.top - 200 :
                            targetRect.top
                }}
                className="absolute w-[320px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 p-6 pointer-events-auto overflow-hidden"
            >
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Sparkles className="h-12 w-12 text-primary-blue" />
                </div>

                <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-blue bg-blue-50 px-3 py-1 rounded-full">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                        <button onClick={endTour} className="text-slate-400 hover:text-slate-600 transition-colors" title="Close tour">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight">{step.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            {step.content}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-1">
                            {currentStep > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={prevStep}
                                    className="h-10 w-10 rounded-full hover:bg-slate-50 text-slate-400"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                            )}
                        </div>

                        <Button
                            onClick={nextStep}
                            className="bg-primary-blue hover:bg-blue-600 text-white rounded-full px-6 h-10 font-bold text-sm shadow-lg shadow-blue-500/30 group"
                        >
                            {currentStep === steps.length - 1 ? "Finish" : "Got it"}
                            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                    <motion.div
                        className="h-full bg-primary-blue"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </motion.div>
        </div>
    )
}
