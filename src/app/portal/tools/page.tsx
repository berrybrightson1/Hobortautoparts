"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DEMO_TOOLS } from "@/lib/demo-data"
import { ArrowRight, Wrench, Search, Truck, DollarSign, FileText, Settings, Plus } from "lucide-react"

export default function ToolsPage() {
    // Helper to map string icon naming to actual component
    const getIcon = (name: string) => {
        switch (name) {
            case 'Search': return <Search className="h-6 w-6" />
            case 'Truck': return <Truck className="h-6 w-6" />
            case 'DollarSign': return <DollarSign className="h-6 w-6" />
            case 'FileText': return <FileText className="h-6 w-6" />
            default: return <Settings className="h-6 w-6" />
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Agent Tools</h2>
                <p className="text-slate-500 font-medium">Utilities to help streamline your sourcing workflow.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {DEMO_TOOLS.map((tool) => (
                    <Card key={tool.name} className="border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-start">
                                <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-primary-blue group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-blue-900/20">
                                    {getIcon(tool.icon)}
                                </div>
                                <Badge variant="secondary" className={
                                    tool.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100 font-semibold px-2 py-0.5" :
                                        tool.status === 'Beta' ? "bg-purple-50 text-purple-600 border-purple-100 font-semibold px-2 py-0.5" : "bg-slate-100 text-slate-500 font-semibold px-2 py-0.5"
                                }>
                                    {tool.status}
                                </Badge>
                            </div>
                            <CardTitle className="mt-6 text-xl font-semibold text-slate-900">{tool.name}</CardTitle>
                            <CardDescription className="text-slate-500 font-medium leading-relaxed mt-2">{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <Button variant="ghost" className="w-full justify-between hover:bg-slate-50 text-slate-400 group-hover:text-primary-blue font-semibold rounded-xl h-11 px-4 transition-colors">
                                Launch Tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {/* Coming Soon Card */}
                <Card className="border-2 border-dashed border-slate-200 shadow-none bg-slate-50/50 flex flex-col items-center justify-center text-center p-8 rounded-[2.5rem] hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer group">
                    <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Plus className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-slate-400 group-hover:text-slate-600 transition-colors">Request a Tool</CardTitle>
                    <CardDescription className="mt-2 text-slate-400 group-hover:text-slate-500 transition-colors">Need something specific? Let us know.</CardDescription>
                </Card>
            </div>
        </div>
    )
}
