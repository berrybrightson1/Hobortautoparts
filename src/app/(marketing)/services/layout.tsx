import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Our Services | Hobort Auto Parts Express",
    description: "Specialized sourcing for Toyota, Honda, Ford, and Mercedes-Benz parts. Genuine US auto parts delivered to Ghana with extreme precision.",
    keywords: ["US auto parts Ghana", "Toyota parts Ghana", "Honda parts sourcing", "Genuine car parts", "Shipping to Ghana"],
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
