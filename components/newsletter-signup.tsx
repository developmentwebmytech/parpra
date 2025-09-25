"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Mail } from "lucide-react"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      })

      if (response.ok) {
        toast({
          title: "Subscribed!",
          description: "Thank you for subscribing to our newsletter",
          variant: "success",
        })
        setEmail("")
        setName("")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to subscribe")
      }
    } catch (error) {
      console.error("Error subscribing:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-gray-900">Stay Updated</h3>
      </div>
      <p className="text-gray-600 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input type="text" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    </div>
  )
}
