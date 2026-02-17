"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"

interface Step {
    target: string
    title: string
    content: string
    position: "top" | "bottom" | "left" | "right"
}

interface TutorialContextType {
    isActive: boolean
    currentStep: number
    steps: Step[]
    startTour: () => void
    endTour: () => void
    nextStep: () => void
    prevStep: () => void
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth()
    const [isActive, setIsActive] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [steps, setSteps] = useState<Step[]>([])

    const role = profile?.role || "customer"

    useEffect(() => {
        const tourSteps: Record<string, Step[]> = {
            admin: [
                {
                    target: "#tour-dashboard",
                    title: "Control Center",
                    content: "This is your overview of all platform activity.",
                    position: "right"
                },
                {
                    target: "#tour-requests",
                    title: "Sourcing Requests",
                    content: "Manage and assign parts requested by customers.",
                    position: "right"
                },
                {
                    target: "#tour-approvals",
                    title: "Quote Approvals",
                    content: "Review agent quotes before they are sent to customers.",
                    position: "right"
                },
                {
                    target: "#tour-support",
                    title: "Live Support",
                    content: "Manage all customer and agent communications in one place.",
                    position: "right"
                }
            ],
            agent: [
                {
                    target: "#tour-pipeline",
                    title: "Sourcing Pipeline",
                    content: "Your active list of parts to find and quote.",
                    position: "right"
                },
                {
                    target: "#tour-messages",
                    title: "Messages",
                    content: "Direct communication with Admins and Customers.",
                    position: "right"
                },
                {
                    target: "#tour-performance",
                    title: "Performance Hub",
                    content: "Track your fulfillment speed and agent rating.",
                    position: "right"
                }
            ],
            customer: [
                {
                    target: "#tour-new-request",
                    title: "Get Parts Fast",
                    content: "Click here to submit your part requirements.",
                    position: "right"
                },
                {
                    target: "#tour-orders",
                    title: "Track Everything",
                    content: "View status and history of all your orders.",
                    position: "right"
                },
                {
                    target: "#tour-messages",
                    title: "Stay Connected",
                    content: "Chat with your assigned agent in real-time.",
                    position: "right"
                }
            ]
        }

        setSteps(tourSteps[role] || tourSteps.customer)
    }, [role])

    // Check if user has already seen the tour for this role
    useEffect(() => {
        // Validation key for the 24-hour rule
        const startKey = `tour_start_${role}`
        const seenKey = `tour_seen_${role}`

        const now = Date.now()
        const storedStart = localStorage.getItem(startKey)

        // If no start time, set it now (First ever login/visit)
        if (!storedStart) {
            localStorage.setItem(startKey, now.toString())
            // Force show immediately
            const timer = setTimeout(() => setIsActive(true), 1500)
            return () => clearTimeout(timer)
        }

        // Check if within 24 hours window
        const startTime = parseInt(storedStart)
        const ONE_DAY_MS = 24 * 60 * 60 * 1000

        if (now - startTime < ONE_DAY_MS) {
            // Within 24 hours: ALWAYS show the tour on refresh/revisit
            // We ignore the "seen" key during this period
            const timer = setTimeout(() => setIsActive(true), 1500)
            return () => clearTimeout(timer)
        } else {
            // After 24 hours: Respect the "completed" state
            const hasSeenTour = localStorage.getItem(seenKey)
            if (!hasSeenTour) {
                const timer = setTimeout(() => setIsActive(true), 1500)
                return () => clearTimeout(timer)
            }
        }
    }, [role])

    const startTour = () => {
        setCurrentStep(0)
        setIsActive(true)
    }

    const endTour = () => {
        setIsActive(false)
        localStorage.setItem(`tour_seen_${role}`, "true")
    }

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            endTour()
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    return (
        <TutorialContext.Provider value={{
            isActive,
            currentStep,
            steps,
            startTour,
            endTour,
            nextStep,
            prevStep
        }}>
            {children}
        </TutorialContext.Provider>
    )
}

export const useTutorial = () => {
    const context = useContext(TutorialContext)
    if (!context) throw new Error("useTutorial must be used within a TutorialProvider")
    return context
}
