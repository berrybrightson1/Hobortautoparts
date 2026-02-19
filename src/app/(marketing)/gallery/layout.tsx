import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Gallery | Brand Live | Hobort Auto Parts Express",
    description: "Photos from our warehouse, client joy moments, and industry exhibitions. See the quality of parts we source from the US to Ghana.",
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
    return children
}
