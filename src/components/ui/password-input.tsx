"use client"

import * as React from "react"
import { Eye, EyeOff, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    showStrength?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, showStrength = false, value, onChange, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false)
        const [strength, setStrength] = React.useState(0)
        const [strengthLabel, setStrengthLabel] = React.useState("")

        const calculateStrength = (pwd: string) => {
            let score = 0
            if (!pwd) return { score: 0, label: "" }
            if (pwd.length > 5) score += 1
            if (pwd.length > 8) score += 1
            if (/[A-Z]/.test(pwd)) score += 1
            if (/[0-9]/.test(pwd)) score += 1
            if (/[^A-Za-z0-9]/.test(pwd)) score += 1

            let label = ""
            if (score <= 2) label = "Weak"
            else if (score <= 4) label = "Medium"
            else label = "Strong"

            return { score, label }
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (showStrength) {
                const { score, label } = calculateStrength(e.target.value)
                setStrength(score)
                setStrengthLabel(label)
            }
            if (onChange) onChange(e)
        }

        return (
            <div className="space-y-3">
                <div className="relative group">
                    <Input
                        type={showPassword ? "text" : "password"}
                        className={cn(
                            "pr-12 h-12 rounded-xl border-primary-blue/10 bg-primary-blue/5 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all font-medium",
                            className
                        )}
                        ref={ref}
                        onChange={handleChange}
                        value={value}
                        {...props}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-blue/30 hover:text-primary-blue focus:outline-none p-2 rounded-lg hover:bg-primary-blue/5 transition-all"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {showStrength && value && String(value).length > 0 && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                {strength <= 2 ? (
                                    <ShieldAlert className="h-3 w-3 text-red-500" />
                                ) : strength <= 4 ? (
                                    <Shield className="h-3 w-3 text-orange-500" />
                                ) : (
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                )}
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest",
                                    strength <= 2 ? "text-red-500" :
                                        strength <= 4 ? "text-orange-500" : "text-emerald-500"
                                )}>
                                    {strengthLabel} Security
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                {Math.min((strength / 5) * 100, 100)}% Verified
                            </span>
                        </div>

                        <div className="flex gap-1 h-1.5 px-0.5">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <div
                                    key={step}
                                    className={cn(
                                        "flex-1 rounded-full transition-all duration-500",
                                        step <= strength
                                            ? strength <= 2 ? "bg-red-500" :
                                                strength <= 4 ? "bg-orange-500" : "bg-emerald-500"
                                            : "bg-slate-100"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
