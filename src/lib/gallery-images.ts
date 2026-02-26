/**
 * HOBORT Auto Express — Gallery Image Manifest
 *
 * HOW TO ADD IMAGES:
 * 1. Drop your image file into one of these folders inside /public:
 *    - public/gallery/new-arrivals/   (warehouse & parts arrival shots)
 *    - public/gallery/client-joys/    (happy customer photos)
 *    - public/gallery/exhibition/     (trade show / event photos)
 *
 * 2. Add a new entry to the array below following the existing pattern.
 *
 * 3. Save the file — the home page slider and gallery page update instantly.
 */

export type GalleryCategory = "new-arrivals" | "client-joys" | "exhibition"

export interface GalleryImage {
    src: string
    alt: string
    category: GalleryCategory
    /** Show in the home-page preview strip hero slot (first featured per category) */
    featured?: boolean
}

export const galleryImages: GalleryImage[] = [
    // ── NEW ARRIVALS ─────────────────────────────────────────────────────────
    {
        src: "/gallery/new-arrivals/1.jpg",
        alt: "Fresh auto parts arriving at Hobort warehouse",
        category: "new-arrivals",
        featured: true,
    },
    {
        src: "/gallery/new-arrivals/2.jpg",
        alt: "New stock delivery at Hobort warehouse",
        category: "new-arrivals",
    },
    {
        src: "/gallery/new-arrivals/3.jpg",
        alt: "Premium car parts ready for dispatch",
        category: "new-arrivals",
    },
    {
        src: "/gallery/new-arrivals/4.jpg",
        alt: "Recent batch of auto parts processed",
        category: "new-arrivals",
    },
    {
        src: "/gallery/new-arrivals/5.jpg",
        alt: "High quality vehicle components arriving",
        category: "new-arrivals",
    },
    {
        src: "/gallery/new-arrivals/6.jpg",
        alt: "Latest inventory additions at our warehouse",
        category: "new-arrivals",
    },

    // ── CLIENT JOYS ──────────────────────────────────────────────────────────
    {
        src: "/gallery/client-joys/11.jpg",
        alt: "Happy client receiving their auto parts order",
        category: "client-joys",
        featured: true,
    },
    {
        src: "/gallery/client-joys/12.jpg",
        alt: "Satisfied garage owner with their Hobort delivery",
        category: "client-joys",
    },
    {
        src: "/gallery/client-joys/13.jpg",
        alt: "Customer celebrating their successful parts sourcing",
        category: "client-joys",
    },

    // ── EXHIBITION ───────────────────────────────────────────────────────────
    {
        src: "/gallery/exhibition/2.jpg",
        alt: "Hobort Auto Express exhibition space",
        category: "exhibition",
        featured: true,
    },
    {
        src: "/gallery/exhibition/22.jpg",
        alt: "Networking with global parts suppliers",
        category: "exhibition",
    },
    {
        src: "/gallery/exhibition/222.jpg",
        alt: "Showcasing US auto parts logistics excellence",
        category: "exhibition",
    },
]

export const CATEGORY_LABELS: Record<GalleryCategory | "all", string> = {
    all: "All",
    "new-arrivals": "New Arrivals",
    "client-joys": "Client Joys",
    exhibition: "Exhibition",
}
