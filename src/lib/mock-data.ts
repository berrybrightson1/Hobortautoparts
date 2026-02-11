export const MOCK_ORDERS = [
    {
        id: "HB-1001",
        vin: "1HGCM82633A001234",
        client: "Kwame Mensah",
        status: "Pending",
        date: "2024-02-10",
        part: "Toyota Camry Engine (2.4L)",
        amount: "$2,450.00",
    },
    {
        id: "HB-1002",
        vin: "JM1CU423580106789",
        client: "Ama Serwaa",
        status: "In Transit",
        date: "2024-02-08",
        part: "Mazda CX-5 Transmission",
        amount: "$1,800.00",
    },
    {
        id: "HB-1003",
        vin: "5NPEH4AF4CH000000",
        client: "Kojo Owusu",
        status: "Ready for Pickup",
        date: "2024-02-05",
        part: "Hyundai Sonata Headlights (Pair)",
        amount: "$450.00",
    },
];

export const TRACKING_STEPS = [
    { status: "Order Received", timestamp: "2024-02-01 09:00 AM", completed: true },
    { status: "Part Sourced (US)", timestamp: "2024-02-03 02:30 PM", completed: true },
    { status: "Arrived at Export Hub (NJ)", timestamp: "2024-02-05 11:15 AM", completed: true },
    { status: "In Transit (Overseas)", timestamp: "2024-02-07 08:00 AM", completed: true },
    { status: "Arrived in Ghana (Tema Port)", timestamp: "2024-02-09 04:45 PM", completed: false },
    { status: "Cleared Customs", timestamp: null, completed: false },
    { status: "Ready for Pickup", timestamp: null, completed: false },
];

export const SERVICES = [
    {
        title: "OEM Parts Sourcing",
        description: "Original equipment from US manufacturers. Guaranteed fit and longevity.",
        icon: "Settings",
    },
    {
        title: "Aftermarket Solutions",
        description: "High-quality alternatives that save you money without sacrificing performance.",
        icon: "Wrench",
    },
    {
        title: "Quality Used Parts",
        description: "Tested and warrantied recycled parts for budget-conscious repairs without compromising on safety.",
        icon: "Recycle",
    },
    {
        title: "Logistics & Freight (Sea/Air)",
        description: "Flexible shipping options: Eco-Sea for bulk/heavy parts or Priority Air for urgent deliveries in 5-7 days.",
        icon: "Truck",
    },
];
