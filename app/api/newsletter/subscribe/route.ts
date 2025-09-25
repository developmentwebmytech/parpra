import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Newsletter } from "@/lib/models/newsletter"
import { emailService } from "@/lib/services/email"

export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email })
    if (existing) {
      if (existing.status === "subscribed") {
        return NextResponse.json({ message: "Already subscribed" })
      } else {
        // Resubscribe
        existing.status = "subscribed"
        await existing.save()
        return NextResponse.json({ message: "Resubscribed successfully" })
      }
    }

    // Create new subscription
    const subscription = new Newsletter({
      email,
      name,
      status: "subscribed",
    })

    await subscription.save()

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, { name: name || "Valued Customer" })
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError)
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({ message: "Subscribed successfully" })
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
