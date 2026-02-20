import { Badge } from "@/components/ui/badge"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "How do you guarantee part compatibility?",
        answer: "Every request is cross-referenced using our advanced VIN decoding system. Our technical team manually verifies each component against the manufacturer's exact specifications before sourcing."
    },
    {
        question: "What is the typical shipping timeline?",
        answer: "Shipping times vary depending on the sourcing location, but most U.S. inventory reaches our global hubs within 5-7 business days. We provide real-time tracking for every step of the journey."
    },
    {
        question: "Can I track my request without an account?",
        answer: "Yes. Every request is assigned a unique tracking ID. You can enter this ID on our Homepage or Tracking Hub to view the live status of your order without needing to sign in."
    },
    {
        question: "How do I edit a request after it's submitted?",
        answer: "If your request is still in 'Pending' status, you can edit it directly from your Customer Portal. Once an agent provides a quote, you can use the live chat to request specific modifications."
    },
    {
        question: "Do you handle customs documentation?",
        answer: "Yes. Our logistics team prepares all necessary export documents and customs declarations to ensure a seamless entry into your country, minimizing delays and unexpected costs."
    },
    {
        question: "What happens if a part is damaged during transit?",
        answer: "All shipments are insured. If a part arrives damaged, our support team will initiate a priority replacement or refund process immediately upon verification of the shipping claim."
    },
    {
        question: "Are the parts genuine OEM?",
        answer: "We offer both authentic OEM (Original Equipment Manufacturer) and certified high-grade aftermarket components. Every part listing clearly specifies its origin and certification status."
    }
]

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-white pb-20 pt-32">
            <div className="container max-w-[1400px] mx-auto px-6">
                <div className="max-w-3xl mb-16 mx-auto text-center">
                    <Badge className="mb-4 bg-primary-blue/5 text-primary-blue hover:bg-primary-blue/10 border-none px-4 py-1 text-xs font-bold uppercase tracking-widest">
                        General Inquiries
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-primary-blue mb-6 font-display">
                        Questions <span className="text-primary-orange">&</span> Answers
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Everything you need to know about our global sourcing and logistics process.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border border-slate-100 rounded-2xl px-6 bg-slate-50/50 hover:bg-white transition-colors">
                                <AccordionTrigger className="text-[13px] font-bold uppercase tracking-widest text-primary-blue hover:no-underline py-6">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-slate-500 font-medium leading-relaxed pb-6 lowercase first-letter:uppercase">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    )
}
