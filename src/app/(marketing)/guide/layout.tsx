import { Metadata } from "next"

export const metadata: Metadata = {
    title: "How It Works | Guide - Hobort Auto Parts Express",
    description: "Learn how to source genuine US auto parts through Hobort Auto Parts Express. Step-by-step guidance for customers and agents.",
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
