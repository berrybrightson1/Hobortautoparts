import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "About Us | Hobort Auto Parts Express",
    description: "Ghana's definitive intercontinental supply chain bridge for US auto parts. Save more, drive faster, and spend smarter with genuine OEM parts.",
    keywords: ["About Hobort Auto", "Ghana auto parts logistics", "US to Ghana shipping", "Genuine parts distributor"],
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return children
}
