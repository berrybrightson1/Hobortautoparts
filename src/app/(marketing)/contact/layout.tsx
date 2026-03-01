import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Contact Us | Hobort Auto Parts Express",
    description: "Get in touch with Hobort Auto Parts Express for reliable auto parts sourcing and logistics support in Ghana.",
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
