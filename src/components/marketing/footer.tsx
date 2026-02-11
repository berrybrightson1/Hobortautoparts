import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-primary-blue py-24 px-4 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            <div className="container mx-auto flex flex-col items-center text-center gap-16 relative z-10">
                <div className="flex flex-col gap-6 max-w-md">
                    <Link href="/" className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-black tracking-tighter text-white uppercase leading-none">
                            HOBORT AUTO PARTS EXPRESS<span className="text-primary-orange">.</span>
                        </span>
                    </Link>
                    <p className="text-sm text-blue-100/60 leading-relaxed font-medium">
                        The leading intercontinental supply chain for genuine automotive components in West Africa. Connecting local expertise with global inventory.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-10 text-sm font-black uppercase tracking-widest text-blue-100">
                    <Link href="/about" className="hover:text-primary-orange transition-colors">About Us</Link>
                    <Link href="/services" className="hover:text-primary-orange transition-colors">Services</Link>
                    <Link href="/dashboard" className="hover:text-primary-orange transition-colors">Portal</Link>
                    <Link href="/quote" className="hover:text-primary-orange transition-colors">Scout Request</Link>
                </div>

                <div className="w-full max-w-5xl h-px bg-white/10" />

                <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl gap-8 text-[10px] text-blue-100/40 font-black uppercase tracking-widest">
                    <p>&copy; {new Date().getFullYear()} Hobort Auto Parts Express. All rights reserved.</p>
                    <div className="flex gap-8">
                        <span className="hover:text-white cursor-pointer transition-colors">Terms & Privacy</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Logistics Hub (USA)</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
