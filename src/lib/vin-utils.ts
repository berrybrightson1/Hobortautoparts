export function validateVIN(vin: string) {
    if (!vin || vin.length !== 17) return false
    if (/[IOQ]/i.test(vin)) return false
    if (!/^[A-HJ-NPR-Z0-9]+$/i.test(vin)) return false
    return true
}
