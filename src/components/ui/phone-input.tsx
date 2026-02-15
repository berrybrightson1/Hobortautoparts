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
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
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

  if (!hasMounted) {
    return (
      <div className={cn("flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 items-center px-4", className)}>
        <div className="h-5 w-8 bg-slate-200 rounded animate-pulse mr-3" />
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="flex h-full w-full rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all items-center overflow-hidden">
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
