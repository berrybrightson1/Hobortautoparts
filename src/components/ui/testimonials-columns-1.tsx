"use client";
import React from "react";

export const TestimonialsColumn = (props: {
    className?: string;
    testimonials: { text: string; name: string; role: string; icon: React.ReactNode }[];
    duration?: number;
}) => {
    return (
        <div className={`${props.className} pause-on-hover`}>
            <div
                className="animate-marquee-vertical gap-6 pb-6 bg-transparent"
                style={{ animationDuration: `${props.duration || 25}s` }}
            >
                {[
                    ...new Array(2).fill(0).map((_, index) => (
                        <React.Fragment key={index}>
                            {props.testimonials.map(({ text, icon, name, role }, i) => (
                                <div className="p-8 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/40 max-w-xs w-full" key={i}>
                                    <div className="text-[#1B3B5A]/80 leading-relaxed text-sm">"{text}"</div>
                                    <div className="flex items-center gap-4 mt-6">
                                        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-orange shrink-0">
                                            {icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="font-bold text-[#1B3B5A] tracking-tight text-sm">{name}</div>
                                            <div className="text-[11px] text-[#1B3B5A]/60 font-medium uppercase tracking-[0.15em] mt-0.5">{role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    )),
                ]}
            </div>
        </div>
    );
};
