"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, CheckCircle2, MessageSquare } from "lucide-react"

export function VehicleInquiryForm({ vehicleName }: { vehicleName: string }) {
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setLoading(false)
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <Card className="border-green-100 bg-green-50 shadow-sm transition-all duration-500 ease-in-out">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center py-10">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">Message Sent!</h3>
                    <p className="text-green-700 max-w-xs">
                        Thanks for inquiring about the {vehicleName}. We'll be in touch shortly.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-6 border-green-200 text-green-800 hover:bg-green-100 hover:text-green-900"
                        onClick={() => setSubmitted(false)}
                    >
                        Send Another
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-slate-200 shadow-sm sticky top-24 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                    <MessageSquare className="h-5 w-5 text-red-600" />
                    Message Seller
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-600 font-semibold">Full Name</Label>
                        <Input id="name" placeholder="Your name" required className="bg-white" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-600 font-semibold">Phone</Label>
                            <Input id="phone" type="tel" placeholder="(555) 555-5555" required className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-600 font-semibold">Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" required className="bg-white" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-slate-600 font-semibold">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="I'm interested in this vehicle..."
                            required
                            className="min-h-[100px] bg-white resize-none"
                            defaultValue={`Hi, I'm interested in the ${vehicleName}. Is it still available?`}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 text-lg shadow-md transition-all hover:shadow-lg mt-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">Processing...</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Send className="h-4 w-4" /> Send Message
                            </span>
                        )}
                    </Button>

                    <p className="text-[10px] text-slate-400 text-center pt-2">
                        By clicking "Send Message", you agree to be contacted by RDM Motors regarding this vehicle.
                    </p>
                </form>
            </CardContent>
        </Card>
    )
}
