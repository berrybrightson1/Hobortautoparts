import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-primary-blue pt-12 pb-28 md:pb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="container max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 border-b border-white/10 pb-10">
                <div className="flex flex-col gap-3 max-w-sm text-center md:text-left">
                    <Link href="/" className="flex items-center md:justify-start justify-center">
                        <span className="text-xl font-semibold tracking-tighter text-white uppercase leading-none">
                            HOBORT AUTO PARTS EXPRESS<span className="text-primary-orange">.</span>
                        </span>
                    </Link>
                    <p className="text-[11px] text-white/60 uppercase font-medium tracking-widest leading-relaxed">
                        Intercontinental Supply Chain • Global Inventory
                    </p>
                    <Link href="/signup?tab=agent" className="mt-2">
                        <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
                            Become a Partner
                        </button>
                    </Link>
                </div>

                <div className="flex flex-wrap items-start justify-center md:justify-end gap-12 text-[10px] font-medium uppercase tracking-widest text-white/80 flex-1">
                    <div className="flex flex-col gap-4 min-w-[140px]">
                        <span className="text-white border-b border-dashed border-white/20 pb-2 mb-2">Navigation</span>
                        <Link href="/about" className="hover:text-primary-orange transition-colors">About</Link>
                        <Link href="/how-it-works" className="hover:text-primary-orange transition-colors">How it Works</Link>
                        <Link href="/services" className="hover:text-primary-orange transition-colors">Services</Link>
                        <Link href="/contact" className="hover:text-primary-orange transition-colors">Contact</Link>
                        <Link href="/portal" className="hover:text-primary-orange transition-colors">Client Portal</Link>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[140px]">
                        <span className="text-white border-b border-dashed border-white/20 pb-2 mb-2">Policies</span>
                        <Link href="/shipping-policy" className="hover:text-primary-orange transition-colors">Shipping Policy</Link>
                        <Link href="/return-policy" className="hover:text-primary-orange transition-colors">Return Policy</Link>
                        <Link href="/privacy-policy" className="hover:text-primary-orange transition-colors">Privacy Policy</Link>
                        <Link href="/sitemap" className="hover:text-primary-orange transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>

            <div className="container max-w-[1400px] mx-auto px-6 mt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-white/40 font-medium uppercase tracking-widest">
                <p>&copy; {new Date().getFullYear()} Hobort. All rights reserved.</p>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                    <Link href="/guide" className="hover:text-primary-orange transition-colors">Platform Guide</Link>
                    <span>Terms & Privacy</span>
                    <span>Info@hobortautopartsexpress.com</span>
                </div>
            </div>
        </footer>
    )
}
