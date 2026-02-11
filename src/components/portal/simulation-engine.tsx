"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { Bell, Package } from "lucide-react"
import { usePortalStore } from "@/lib/store"

const LOCATIONS = ["Accra", "Kumasi", "Takoradi", "Tamale", "Tema", "Cape Coast"]
const VEHICLES = [
    "2018 Toyota Camry",
    "2020 Honda Accord",
    "2015 Ford F-150",
    "2019 Hyundai Tucson",
    "2021 Benz C300",
    "2016 BMW X5"
]

export function SimulationEngine() {
    const { notifications, addNotification } = usePortalStore()

    useEffect(() => {
        if (notifications.length >= 2) return

        let count = notifications.length
        const MAX_NOTIFICATIONS = 2
        let timerId: NodeJS.Timeout

        const scheduleNext = () => {
            if (count >= MAX_NOTIFICATIONS) return

            // Random interval between 15s and 45s (slightly adjusted)
            const delay = Math.floor(Math.random() * (45000 - 15000 + 1) + 15000)

            timerId = setTimeout(() => {
                // Generate random notification
                const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
                const vehicle = VEHICLES[Math.floor(Math.random() * VEHICLES.length)]
                const title = "New Sourcing Request"
                const message = `${vehicle} requested from ${location}`

                // 1. Show Toast
                toast(title, {
                    description: message,
                    // Use a simple, non-dynamic icon to avoid key issues if any, keeping it clean
                    icon: <Bell className="text-primary-orange h-5 w-5" />,
                    duration: 5000,
                })

                // 2. Add to Store
                addNotification({
                    id: Math.random().toString(36).substr(2, 9),
                    title: "New Request",
                    message: message,
                    time: "Just now",
                    read: false,
                    type: 'order'
                })

                count++
                if (count < MAX_NOTIFICATIONS) {
                    scheduleNext()
                }
            }, delay)
        }

        scheduleNext()

        return () => clearTimeout(timerId)
    }, [addNotification])

    return null
}
