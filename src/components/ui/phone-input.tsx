"use client"

import React, { useEffect, useState } from "react"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { cn } from "@/lib/utils"

interface SmartPhoneInputProps {
    value: string
    onChange: (value: string) => void
    className?: string
    placeholder?: string
    id?: string
}

export function SmartPhoneInput({ value, onChange, className, placeholder, id }: SmartPhoneInputProps) {
    const [defaultCountry, setDefaultCountry] = useState<any>()

    useEffect(() => {
        // Fetch user's country based on IP
        fetch("https://ipapi.co/json/")
            .then((res) => res.json())
            .then((data) => {
                if (data && data.country_code) {
                    setDefaultCountry(data.country_code)
                }
            })
            .catch((err) => {
                console.error("Failed to fetch geolocation for phone input", err)
                setDefaultCountry("GH") // Fallback to Ghana
            })
    }, [])

    return (
        <div className={cn("relative", className)}>
            <style jsx global>{`
        .PhoneInput {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .PhoneInputCountry {
          display: flex;
          align-items: center;
          padding-left: 1rem;
        }
        .PhoneInputCountrySelect {
          display: none;
        }
        .PhoneInputCountryIcon {
          width: 24px;
          height: 18px;
          border-radius: 2px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .PhoneInputInput {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-weight: 600;
          color: #0f172a; /* primary-blue */
          height: 100%;
        }
        .PhoneInputInput::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }
      `}</style>

            <div className="flex h-16 w-full rounded-[1.25rem] border border-slate-100 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all items-center overflow-hidden">
                <PhoneInput
                    international
                    defaultCountry={defaultCountry}
                    value={value}
                    onChange={(val) => onChange(val as string)}
                    placeholder={placeholder || "Enter phone number"}
                    id={id}
                    className="w-full h-full"
                />
            </div>
        </div>
    )
}
