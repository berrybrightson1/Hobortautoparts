import {
    Zap,
    Settings,
    Disc,
    Activity,
    Shield,
    Wind,
    Layout,
    Lightbulb,
    Thermometer,
    Wrench,
    Car
} from "lucide-react"

export interface PartItem {
    id: string
    name: string
    description?: string
}

export interface PartCategory {
    id: string
    name: string
    icon: any
    parts: PartItem[]
}

export const PART_LIBRARY: PartCategory[] = [
    {
        id: "engine",
        name: "Engine & Drivetrain",
        icon: Settings,
        parts: [
            { id: "engine-assembly", name: "Engine Assembly" },
            { id: "transmission", name: "Transmission / Gearbox" },
            { id: "turbocharger", name: "Turbocharger / Supercharger" },
            { id: "alternator", name: "Alternator" },
            { id: "starter-motor", name: "Starter Motor" },
            { id: "fuel-pump", name: "Fuel Pump" },
            { id: "clutch-kit", name: "Clutch Kit" },
            { id: "radiator", name: "Radiator" },
            { id: "water-pump", name: "Water Pump" },
            { id: "drive-belt", name: "Drive Belt / Serpentine Belt" },
        ]
    },
    {
        id: "suspension",
        name: "Suspension & Steering",
        icon: Activity,
        parts: [
            { id: "shock-absorbers", name: "Shock Absorbers / Struts" },
            { id: "control-arms", name: "Control Arms" },
            { id: "tie-rod-ends", name: "Tie Rod Ends" },
            { id: "power-steering-pump", name: "Power Steering Pump" },
            { id: "rack-pinion", name: "Steering Rack & Pinion" },
            { id: "wheel-bearings", name: "Wheel Bearings" },
            { id: "coil-springs", name: "Coil Springs" },
            { id: "ball-joints", name: "Ball Joints" },
        ]
    },
    {
        id: "braking",
        name: "Brake System",
        icon: Disc,
        parts: [
            { id: "brake-pads", name: "Brake Pads (Front/Rear)" },
            { id: "brake-rotors", name: "Brake Rotors / Discs" },
            { id: "brake-calipers", name: "Brake Calipers" },
            { id: "master-cylinder", name: "Brake Master Cylinder" },
            { id: "abs-sensor", name: "ABS Sensor" },
            { id: "brake-booster", name: "Brake Booster" },
            { id: "brake-lines", name: "Brake Lines / Hoses" },
        ]
    },
    {
        id: "body",
        name: "Body & Exterior",
        icon: Layout,
        parts: [
            { id: "front-bumper", name: "Front Bumper" },
            { id: "rear-bumper", name: "Rear Bumper" },
            { id: "headlight-assembly", name: "Headlight Assembly" },
            { id: "taillight-assembly", name: "Taillight Assembly" },
            { id: "fenders", name: "Fenders / Wings" },
            { id: "hood-bonnet", name: "Hood / Bonnet" },
            { id: "grille", name: "Front Grille" },
            { id: "side-mirrors", name: "Side Mirrors" },
            { id: "doors", name: "Doors" },
            { id: "windshield-glass", name: "Windshield / Window Glass" },
        ]
    },
    {
        id: "electrical",
        name: "Electrical & Lighting",
        icon: Zap,
        parts: [
            { id: "battery", name: "Car Battery" },
            { id: "ecu-unit", name: "ECU / Engine Control Unit" },
            { id: "ignition-coils", name: "Ignition Coils" },
            { id: "spark-plugs", name: "Spark Plugs" },
            { id: "wiring-harness", name: "Wiring Harness" },
            { id: "sensors-o2", name: "O2 Sensors" },
            { id: "sensors-maf", name: "MAF Sensor" },
            { id: "fuse-box", name: "Fuse Box / TIPM" },
        ]
    },
    {
        id: "cooling",
        name: "Cooling & AC",
        icon: Thermometer,
        parts: [
            { id: "ac-compressor", name: "AC Compressor" },
            { id: "condenser", name: "AC Condenser" },
            { id: "cooling-fan", name: "Radiator Cooling Fan" },
            { id: "thermostat", name: "Thermostat" },
            { id: "expansion-tank", name: "Coolant Expansion Tank" },
            { id: "evaporator", name: "AC Evaporator" },
        ]
    },
    {
        id: "exhaust",
        name: "Exhaust System",
        icon: Wind,
        parts: [
            { id: "exhaust-manifold", name: "Exhaust Manifold" },
            { id: "catalytic-converter", name: "Catalytic Converter" },
            { id: "muffler", name: "Muffler / Silencer" },
            { id: "exhaust-pipe", name: "Exhaust Pipe" },
        ]
    },
]
