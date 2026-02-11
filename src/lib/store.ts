import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'customer' | 'agent' | 'admin'

export interface OrderRequest {
    id: string
    vin: string
    vehicleInfo: string
    brand: string
    parts: string[]
    urgency: string
    status: 'pending' | 'verifying' | 'quoted' | 'shipped' | 'delivered'
    createdAt: string
    customerName: string
}

export interface Notification {
    id: string
    title: string
    message: string
    time: string
    read: boolean
    type: 'order' | 'system' | 'promo'
}

interface PortalState {
    role: UserRole
    orders: OrderRequest[]
    notifications: Notification[]
    setRole: (role: UserRole) => void
    addOrder: (order: Omit<OrderRequest, 'id' | 'createdAt' | 'status'>) => void
    updateOrderStatus: (id: string, status: OrderRequest['status']) => void
    addNotification: (notification: Notification) => void
    markAllRead: () => void
    clearNotifications: () => void
}

export const usePortalStore = create<PortalState>()(
    persist(
        (set) => ({
            role: 'customer',
            orders: [],
            notifications: [
                {
                    id: 'test-1',
                    title: 'New Sourcing Request',
                    message: '2019 Mercedes G-Class parts requested from Accra Hub.',
                    time: '2 hours ago',
                    read: false,
                    type: 'order'
                },
                {
                    id: 'test-2',
                    title: 'Global Shipment Update',
                    message: 'Batch #HB-3421 cleared customs and is ready for Tema pickup.',
                    time: '5 hours ago',
                    read: false,
                    type: 'system'
                }
            ],
            setRole: (role) => set({ role }),
            addOrder: (order) => set((state) => ({
                orders: [
                    {
                        ...order,
                        id: `HB-${Math.floor(1000 + Math.random() * 9000)}`,
                        createdAt: new Date().toISOString(),
                        status: 'pending'
                    },
                    ...state.orders
                ]
            })),
            updateOrderStatus: (id, status) => set((state) => ({
                orders: state.orders.map((o) => o.id === id ? { ...o, status } : o)
            })),
            addNotification: (notification) => set((state) => ({
                notifications: [notification, ...state.notifications]
            })),
            markAllRead: () => set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, read: true }))
            })),
            clearNotifications: () => set({ notifications: [] })
        }),
        {
            name: 'hobort-portal-storage'
        }
    )
)

export const MOCK_CATALOG: Record<string, string[]> = {
    toyota: [
        "Front Brake Pads",
        "Oil Filter (Synthetic)",
        "Timing Belt Kit",
        "Water Pump Replacement",
        "Alternator (OEM)",
        "Strut Assembly (Front)",
        "Oxygen Sensor",
        "Ignition Coil Pack"
    ],
    honda: [
        "VTEC Solenoid Gasket",
        "Transmission Fluid (DEXRON)",
        "Lower Control Arm",
        "Cabin Air Filter",
        "Radiator Assembly",
        "Drive Belt Tensioner",
        "Fuel Pump Module"
    ],
    ford: [
        "Spark Plug Set (Platinum)",
        "Brake Rotor (Front)",
        "Wheel Hub Assembly",
        "Power Steering Pump",
        "Exhaust Manifold Gasket",
        "Starter Motor"
    ],
    nissan: [
        "CVT Transmission Filter",
        "Variable Valve Timing Solenoid",
        "Mass Air Flow Sensor",
        "Crankshaft Position Sensor",
        "Brake Caliper (Rear)"
    ],
    mercedes: [
        "Air Suspension Air Spring",
        "Auxiliary Battery",
        "Control Arm Bushing Kit",
        "Engine Mount (Hydraulic)",
        "Fuel Injector Set"
    ],
    bmw: [
        "Coolant Expansion Tank",
        "Oil Cooler Gasket",
        "Vanos Solenoid",
        "Drive Shaft Flex Disc",
        "Water Pump (Electric)"
    ]
}

export const getBrandFromVIN = (vin: string): string => {
    const v = vin.toUpperCase()
    if (v.startsWith('1') || v.startsWith('2') || v.startsWith('3') || v.startsWith('4') || v.startsWith('5')) {
        // North American manufacturers simplified
        if (v.startsWith('1HG') || v.startsWith('2HG') || v.startsWith('5FN')) return 'honda'
        if (v.startsWith('1NX') || v.startsWith('2T1') || v.startsWith('5TD')) return 'toyota'
        if (v.startsWith('1FT') || v.startsWith('1FM') || v.startsWith('2FT')) return 'ford'
    }
    if (v.startsWith('J')) return 'toyota' // Japan mostly Toyota/Lexus in this mock
    if (v.startsWith('W')) return 'mercedes' // Germany mostly MB/BMW in this mock
    return 'other'
}
