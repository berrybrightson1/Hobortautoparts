import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const id = (await params).id
    return {
        title: `Tracking: ${id} | Hobort Auto Parts Express`,
        description: `Track your Hobort Auto Parts Express shipment with tracking ID ${id}. Live status updates and milestones.`,
    }
}

export default function TrackLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
