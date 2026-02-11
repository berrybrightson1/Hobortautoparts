
import { OrderRequest } from "./store"

export const DEMO_USERS = [
    { id: 'u1', name: 'Alex Johnson', email: 'alex.j@example.com', role: 'Customer', status: 'Active', spent: '$1,240', lastActive: '2 mins ago', avatar: 'AJ' },
    { id: 'u2', name: 'Sarah Williams', email: 'sarah.w@example.com', role: 'Agent', status: 'Active', spent: '-', lastActive: '5 hours ago', avatar: 'SW' },
    { id: 'u3', name: 'Michael Brown', email: 'm.brown@logistics.com', role: 'Customer', status: 'Inactive', spent: '$850', lastActive: '2 days ago', avatar: 'MB' },
    { id: 'u4', name: 'Emily Davis', email: 'emily.d@example.com', role: 'Admin', status: 'Active', spent: '-', lastActive: 'Just now', avatar: 'ED' },
    { id: 'u5', name: 'David Wilson', email: 'david.w@mechanic.com', role: 'Customer', status: 'Active', spent: '$3,420', lastActive: '1 day ago', avatar: 'DW' },
]

export const DEMO_ORDERS: OrderRequest[] = [
    { id: 'HB-7821', customerName: 'Alex Johnson', vin: 'JHMZB...', vehicleInfo: '2019 Honda Civic Type R', brand: 'Honda', parts: ['Brake Pads', 'Rotors'], urgency: 'High', status: 'pending', createdAt: '2023-10-24T10:30:00Z' },
    { id: 'HB-7822', customerName: 'David Wilson', vin: 'WDBHF...', vehicleInfo: '2020 Mercedes C300', brand: 'Mercedes', parts: ['Air Filter', 'Oil Filter', 'Spark Plugs'], urgency: 'Normal', status: 'quoted', createdAt: '2023-10-23T14:15:00Z' },
    { id: 'HB-7823', customerName: 'Michael Brown', vin: '1GJE...', vehicleInfo: '2018 Chevy Silverado', brand: 'Chevrolet', parts: ['Fuel Pump'], urgency: 'Critical', status: 'verifying', createdAt: '2023-10-22T09:45:00Z' },
    { id: 'HB-7824', customerName: 'Alex Johnson', vin: 'JHMZB...', vehicleInfo: '2019 Honda Civic Type R', brand: 'Honda', parts: ['Wiper Blades'], urgency: 'Low', status: 'delivered', createdAt: '2023-10-20T16:20:00Z' },
    { id: 'HB-7825', customerName: 'Susan Clark', vin: 'JN1AZ...', vehicleInfo: '2021 Nissan Altima', brand: 'Nissan', parts: ['CVT Fluid', 'Transmission Filter'], urgency: 'Normal', status: 'shipped', createdAt: '2023-10-18T11:00:00Z' },
    // Merged from MOCK_ORDERS for public tracking demo
    { id: 'HB-1001', customerName: 'Kwame Mensah', vin: '1HGCM82633A001234', vehicleInfo: '2015 Toyota Camry', brand: 'Toyota', parts: ['Engine (2.4L)'], urgency: 'High', status: 'pending', createdAt: '2024-02-10T09:00:00Z' },
    { id: 'HB-1002', customerName: 'Ama Serwaa', vin: 'JM1CU423580106789', vehicleInfo: '2018 Mazda CX-5', brand: 'Mazda', parts: ['Transmission Assembly'], urgency: 'Critical', status: 'shipped', createdAt: '2024-02-08T14:30:00Z' },
    { id: 'HB-1003', customerName: 'Kojo Owusu', vin: '5NPEH4AF4CH000000', vehicleInfo: '2019 Hyundai Sonata', brand: 'Hyundai', parts: ['Headlights (Pair)'], urgency: 'Normal', status: 'delivered', createdAt: '2024-02-05T10:00:00Z' },
]

export const getTrackingSteps = (status: OrderRequest['status'], date: string) => {
    const steps = [
        { status: "Order Received", date: date, completed: true },
        { status: "Sourcing Verified", date: new Date(new Date(date).getTime() + 86400000).toISOString(), completed: ['quoted', 'verifying', 'shipped', 'delivered'].includes(status) },
        { status: "Arrived at Export Hub (NJ)", date: new Date(new Date(date).getTime() + 172800000).toISOString(), completed: ['shipped', 'delivered'].includes(status) },
        { status: "In Transit (Air/Sea)", date: new Date(new Date(date).getTime() + 259200000).toISOString(), completed: ['shipped', 'delivered'].includes(status) },
        { status: "Cleared Customs (Tema)", date: new Date(new Date(date).getTime() + 432000000).toISOString(), completed: ['delivered'].includes(status) },
        { status: "Ready for Pickup/Delivery", date: new Date(new Date(date).getTime() + 439200000).toISOString(), completed: ['delivered'].includes(status) },
    ]
    return steps
}

export const DEMO_STATS = [
    { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', trend: 'up' },
    { label: 'Active Orders', value: '12', change: '+4', trend: 'up' },
    { label: 'Pending Quotes', value: '5', change: '-2', trend: 'down' },
    { label: 'Avg. Fulfillment', value: '2.4 Days', change: '-0.5 Days', trend: 'up' },
]

export const REVENUE_DATA = [
    { name: 'Jan', total: 1500 },
    { name: 'Feb', total: 2300 },
    { name: 'Mar', total: 3400 },
    { name: 'Apr', total: 2900 },
    { name: 'May', total: 4500 },
    { name: 'Jun', total: 5100 },
    { name: 'Jul', total: 4800 },
]

export const DEMO_LOGS = [
    { id: 1, action: 'Order Created', details: 'Order #HB-7821 created by Alex Johnson', time: '10:30 AM', type: 'info' },
    { id: 2, action: 'Payment Processed', details: 'Payment of $120.00 received for #HB-7824', time: '11:15 AM', type: 'success' },
    { id: 3, action: 'Quote Rejected', details: 'Customer rejected quote for #HB-7820', time: 'Yesterday', type: 'warning' },
    { id: 4, action: 'System Update', details: 'Catalog synchronized with rapid-api', time: 'Yesterday', type: 'info' },
    { id: 5, action: 'User Login', details: 'Agent Sarah logged in', time: '2 days ago', type: 'info' },
]

export const DEMO_TOOLS = [
    { name: 'VIN Decoder', description: 'Decode VINs to get detailed vehicle specs.', icon: 'Search', status: 'Active' },
    { name: 'Parts Compatibility', description: 'Check if parts fit a specific vehicle chassis.', icon: 'Settings', status: 'Beta' },
    { name: 'Shipping Calculator', description: 'Estimate shipping costs typically for air freight.', icon: 'Truck', status: 'Active' },
    { name: 'Currency Converter', description: 'Real-time exchange rates for sourcing.', icon: 'DollarSign', status: 'Active' },
    { name: 'Invoice Generator', description: 'Create professional PDF invoices instantly.', icon: 'FileText', status: 'Maintenance' },
]
export const DEMO_KYC_REQUESTS = [
    { id: 'kyc1', name: 'Premium Garage West', type: 'Wholesale', appliedDate: '2 hours ago', status: 'Pending', documents: ['Business License', 'Tax ID'] },
    { id: 'kyc2', name: 'John Sourcing Ltd', type: 'Agent', appliedDate: '5 hours ago', status: 'Reviewing', documents: ['ID Proof', 'Experience Cert'] },
    { id: 'kyc3', name: 'Mainland Auto Parts', type: 'Wholesale', appliedDate: '1 day ago', status: 'Pending', documents: ['Business License'] },
]

export const DEMO_DEMAND_HEATMAP = [
    { brand: 'Mercedes-Benz', models: [{ name: 'C-Class', requests: 45 }, { name: 'E-Class', requests: 32 }, { name: 'G-Class', requests: 28 }] },
    { brand: 'Toyota', models: [{ name: 'Camry', requests: 88 }, { name: 'Corolla', requests: 65 }, { name: 'Land Cruiser', requests: 42 }] },
    { brand: 'Honda', models: [{ name: 'Civic', requests: 52 }, { name: 'Accord', requests: 38 }, { name: 'CR-V', requests: 25 }] },
    { brand: 'BMW', models: [{ name: '3 Series', requests: 38 }, { name: '5 Series', requests: 22 }, { name: 'X5', requests: 19 }] },
]
