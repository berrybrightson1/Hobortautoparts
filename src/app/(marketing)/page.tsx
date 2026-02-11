"use client"

import React, { useState, useEffect } from "react"
import { Search, ShieldCheck, Zap, Truck, Star, ArrowRight, Play, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

// ... (existing imports)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function LandingPage() {
  const [testimonialPage, setTestimonialPage] = useState(0)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const itemsPerPage = isMobile ? 1 : 4

  const testimonials = [
    {
      quote: "Hobort is the only sourcing hub I trust for my clients' high-end American imports. The VIN verification is flawless.",
      author: "Samuel Osei",
      role: "CEO and Co-founder",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel"
    },
    {
      quote: "Finally, a logistics partner that understands the urgency of a repair shop. Parts arrive on schedule, every time.",
      author: "Kofi Boateng",
      role: "Operations Director",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kofi"
    },
    {
      quote: "The direct sourcing from US elite hubs has cut our procurement costs by 22% this quarter alone.",
      author: "Emmanuel Mensah",
      role: "Fleet Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emmanuel"
    },
    {
      quote: "Zero hassle. They handle the NJ export and Tema clearance while I focus on fixing cars.",
      author: "Prince Appiah",
      role: "Garage Owner",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prince"
    }
  ]

  const totalPages = Math.ceil(testimonials.length / itemsPerPage)

  // Reset page when switching views to prevent out-of-bounds
  useEffect(() => {
    setTestimonialPage(0)
  }, [itemsPerPage])

  useEffect(() => {
    const intervalTime = isMobile ? 5000 : 8000
    const timer = setInterval(() => {
      setTestimonialPage((prev) => (prev + 1) % totalPages)
    }, intervalTime)
    return () => clearInterval(timer)
  }, [totalPages, isMobile])

  return (
    <div className="flex flex-col">
      {/* Premium Centered Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36">
        {/* Step 3: Hero Ambient Depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[70%] bg-primary-orange/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[70%] bg-primary-blue/5 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,white_90%)]" />
        </div>

        <div className="container px-4 text-center mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-100 text-primary-blue text-xs font-bold uppercase tracking-[0.2em] ring-1 ring-slate-200">
              <Star className="h-3 w-3 text-primary-orange fill-primary-orange" />
              Ghana's #1 US Parts Hub
            </div>

            <h1 className="text-5xl font-black tracking-tight text-primary-blue sm:text-6xl md:text-7xl leading-[1.1]">
              Genuine <br className="sm:hidden" /> Auto Parts. <br />
              <span className="text-primary-orange">Direct from <br className="sm:hidden" /> Source.</span>
            </h1>

            <p className="max-w-[700px] text-lg text-slate-500 md:text-xl leading-relaxed">
              Experience zero-hassle sourcing. We connect West Africa's leading mechanics with authentic, VIN-verified components at affordable prices. Quality guaranteed.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row mt-4">
              <Link href="/quote">
                <Button variant="orange" size="lg" className="rounded-full px-10 h-14 text-lg shadow-premium">
                  Request a Quote <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg border-2">
                <Play className="mr-2 h-4 w-4 fill-primary-blue" /> How it Works
              </Button>
            </div>

            {/* Premium Tracking Widget (Redesigned) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-16 w-full max-w-2xl relative"
            >
              <div className="glass p-2 rounded-[2rem] shadow-premium group/tracker transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(27,78,111,0.15)] border-2 border-slate-200/60 ring-1 ring-slate-100/50">
                <div className="bg-white/80 backdrop-blur-xl rounded-[1.75rem] p-3 md:p-4 flex flex-col md:flex-row gap-3 items-center border border-white relative overflow-hidden">
                  <div className="flex-1 w-full relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/tracker:text-primary-orange transition-colors">
                      <Search className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter Order ID (e.g. HB-1001)"
                      className="w-full h-16 rounded-2xl border-2 border-slate-50 bg-slate-50/30 pl-16 pr-6 text-lg font-medium focus:bg-white focus:ring-8 focus:ring-primary-orange/5 focus:border-primary-orange transition-all outline-none placeholder:text-slate-400"
                      onChange={(e) => window.localStorage.setItem('temp_track_id', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.currentTarget as HTMLInputElement).value
                          if (val) window.location.href = `/track/${val}`
                        }
                      }}
                    />
                  </div>
                  <Button
                    variant="orange"
                    className="h-16 px-12 rounded-2xl w-full md:w-auto font-black text-lg shadow-xl shadow-primary-orange/20 hover:shadow-primary-orange/40 hover:-translate-y-0.5 transition-all group-hover/tracker:scale-[1.02]"
                    onClick={() => {
                      const val = window.localStorage.getItem('temp_track_id')
                      if (val) window.location.href = `/track/${val}`
                    }}
                  >
                    Locate Shipment
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-10">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-blue/30" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">NJ Export Hub</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-blue/30" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Texas Logistics</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400/30" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-600/60">Accra Delivery</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Step 1: Dynamic Brand Marquee */}
      <section className="bg-primary-blue py-10 border-y border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-primary-blue to-transparent z-10" />
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-primary-blue to-transparent z-10" />

        <div className="flex overflow-hidden relative">
          <div className="flex animate-marquee pause-on-hover whitespace-nowrap gap-20 items-center py-2">
            {[...Array(10)].map((_, i) => (
              <React.Fragment key={i}>
                <span className="text-2xl font-black text-white/40 italic tracking-tighter hover:text-white hover:scale-110 transition-all cursor-default">TOYOTA</span>
                <span className="text-2xl font-black text-white/40 italic tracking-tighter hover:text-white hover:scale-110 transition-all cursor-default">MAZDA</span>
                <span className="text-2xl font-black text-white/40 italic tracking-tighter hover:text-white hover:scale-110 transition-all cursor-default">HONDA</span>
                <span className="text-2xl font-black text-white/40 italic tracking-tighter hover:text-white hover:scale-110 transition-all cursor-default">MITSUBISHI</span>
                <span className="text-2xl font-black text-white/40 italic tracking-tighter hover:text-white hover:scale-110 transition-all cursor-default">LEXUS</span>
                <span className="text-2xl font-black text-white/40 italic tracking-tighter hover:text-white hover:scale-110 transition-all cursor-default">NISSAN</span>
                <span className="text-2xl font-black text-white/40 italic tracking-tighter hover:text-white hover:scale-110 transition-all cursor-default">FORD</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
      {/* Step 2: 3-Step Intelligence Process */}
      {/* Step 2: 3-Step Intelligence Process - Mobile Optimized */}
      <section className="py-12 md:py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-slate-100 -z-10" />

            {[
              { step: "01", icon: Search, title: "Identify", desc: "Scan VIN or brand to target exact specs." },
              { step: "02", icon: ShieldCheck, title: "Source", desc: "Real-time lookup across elite US hubs." },
              { step: "03", icon: Truck, title: "Deliver", desc: "Priority air or sea freight to your bay." }
            ].map((item, i) => (
              <div key={i} className="flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-6 group bg-slate-50/50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border border-slate-100/50 md:border-none shadow-sm md:shadow-none">
                <div className="relative shrink-0">
                  <div className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-[2rem] bg-slate-50 md:bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-blue group-hover:bg-primary-orange group-hover:text-white transition-all duration-500 shadow-sm md:group-hover:scale-110 md:group-hover:rotate-3">
                    <item.icon className="h-6 w-6 md:h-10 md:w-10" />
                  </div>
                  <div className="hidden md:flex absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white border border-slate-100 items-center justify-center text-xs font-black text-primary-blue shadow-sm">
                    {item.step}
                  </div>
                </div>
                <div className="flex flex-col gap-1 md:gap-2 text-left md:text-center">
                  <div className="flex items-center gap-2 md:justify-center">
                    <span className="md:hidden text-xs font-black text-primary-orange bg-orange-50 px-2 py-0.5 rounded-full ring-1 ring-orange-100">{item.step}</span>
                    <h3 className="text-lg md:text-xl font-black text-primary-blue tracking-tight uppercase">{item.title}</h3>
                  </div>
                  <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      < section className="py-20 bg-slate-50/80 relative" >
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 flex flex-col gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary-orange">The Hobort Advantage</h2>
            <p className="text-3xl font-bold text-primary-blue tracking-tight">Why we are the preferred partner for Ghana's mechanics.</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {[
              {
                icon: Zap,
                title: "Direct from Source",
                desc: "We skip the middlemen. Your parts come straight from elite US retailers, ensuring pure quality and unbeatable value.",
                bg: "bg-orange-50",
                color: "text-primary-orange"
              },
              {
                icon: ShieldCheck,
                title: "Quality Guaranteed",
                desc: "Every component is cross-referenced with your VIN by our scouters to ensure 100% genuine fitment.",
                bg: "bg-blue-50",
                color: "text-primary-blue"
              },
              {
                icon: Truck,
                title: "Logistics Mastery",
                desc: "From New Jersey export hubs to Tema port clearance, we handle every kilometer of the journey.",
                bg: "bg-green-50",
                color: "text-green-600"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-premium hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center"
              >
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500", feature.bg)}>
                  <feature.icon className={cn("h-7 w-7", feature.color)} />
                </div>
                <h3 className="text-2xl font-bold text-primary-blue mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section >

      {/* Centered Showcase Section */}
      < section className="py-24 bg-white relative overflow-hidden" >
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1b4e6f_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-10">
            <h2 className="text-3xl font-black text-primary-blue md:text-5xl leading-[1.1] tracking-tight">
              Genuine Sourcing. <br />
              <span className="text-primary-orange">Affordable Logistics.</span>
            </h2>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl">
              Join a network of over 450 Ghanaian garage owners who have revolutionized their supply chain with Hobort Auto Parts Express.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8 md:gap-16 w-full max-w-3xl mt-4">
              <div className="flex flex-col gap-2">
                <p className="text-4xl md:text-5xl font-black text-primary-blue">450+</p>
                <p className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-[0.2em]">Garages Served</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-4xl md:text-5xl font-black text-primary-blue">12k+</p>
                <p className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-[0.2em]">Parts Delivered</p>
              </div>
              <div className="flex flex-col gap-2 col-span-2 md:col-span-1 items-center md:items-start">
                <p className="text-4xl md:text-5xl font-black text-primary-blue">100%</p>
                <p className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-[0.2em]">VIN Accuracy</p>
              </div>
            </div>

            {/* Step 4: 4-Set Horizontal Smooth Testimonial Slider */}
            <div className="mt-20 w-full max-w-[90rem] mx-auto px-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialPage}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
                >
                  {testimonials.slice(testimonialPage * itemsPerPage, (testimonialPage * itemsPerPage) + itemsPerPage).map((testimonial, i) => (
                    <div
                      key={i}
                      className="relative h-full min-h-[320px] bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-xl hover:bg-white group/testimonial"
                    >
                      <div className="flex flex-col gap-4">
                        <Quote className="h-10 w-10 text-primary-blue/20 fill-primary-blue/5" />
                        <p className="text-lg font-medium text-slate-700 leading-relaxed tracking-tight text-left">
                          {testimonial.quote}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 ring-4 ring-white shadow-sm shrink-0">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.author}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 text-left">
                          <p className="text-base font-bold text-primary-blue truncate">{testimonial.author}</p>
                          <p className="text-[10px] font-black text-slate-400 truncate uppercase tracking-[0.2em]">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Set-based Pagination Dots */}
              <div className="mt-16 flex justify-center gap-3">
                {[...Array(isMobile ? 3 : totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isMobile) setTestimonialPage(i)
                    }}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-700",
                      i === (isMobile ? testimonialPage % 3 : testimonialPage)
                        ? "bg-primary-orange w-12"
                        : "bg-slate-200 w-3"
                    )}
                    aria-label={`Go to testimonial page ${i + 1}`}
                    disabled={isMobile}
                  />
                ))}
              </div>

              <div className="pt-12 text-center">
                <Link href="/quote">
                  <Button variant="orange" size="lg" className="rounded-full px-16 h-20 text-xl font-black shadow-premium hover:scale-105 transition-transform">
                    Start Your First Scout
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Minimal Sticky CTA - Mobile */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-6 right-6 z-50 md:hidden"
        >
          <div className="h-16 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-2xl flex items-center justify-between pl-6 pr-2">
            <span className="text-sm font-bold text-slate-800">Ready to order?</span>
            <Link href="/quote">
              <Button variant="orange" className="h-12 px-6 rounded-full text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform">
                Start Sourcing
              </Button>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
