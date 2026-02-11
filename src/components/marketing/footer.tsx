import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-primary-blue py-12 px-4 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 border-b border-white/10 pb-10">
                <div className="flex flex-col gap-3 max-w-sm text-center md:text-left">
                    <Link href="/" className="flex items-center md:justify-start justify-center">
                        <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                            HOBORT AUTO PARTS EXPRESS<span className="text-primary-orange">.</span>
                        </span>
                    </Link>
                    <p className="text-[11px] text-blue-100/40 uppercase font-black tracking-widest leading-relaxed">
                        Intercontinental Supply Chain • Global Inventory
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-blue-100/60">
                    <Link href="/about" className="hover:text-primary-orange transition-colors">About</Link>
                    <Link href="/services" className="hover:text-primary-orange transition-colors">Services</Link>
                    <Link href="/contact" className="hover:text-primary-orange transition-colors">Contact</Link>
                    <Link href="/portal" className="hover:text-primary-orange transition-colors">Client Portal</Link>
                </div>
            </div>

            <div className="container mx-auto mt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-blue-100/30 font-black uppercase tracking-widest">
                <p>&copy; {new Date().getFullYear()} Hobort. All rights reserved.</p>
                <div className="flex gap-8">
                    <span>Terms & Privacy</span>
                    <span>Info@hobortautopartsexpress.com</span>
                </div>
            </div>
        </footer>
    )
}
