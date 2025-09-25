import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Newsletter } from "@/lib/models/newsletter"
import { emailService } from "@/lib/services/email"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { subject, content } = await request.json()

    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 })
    }

    // Get all active subscribers
    const subscribers = await Newsletter.find({ status: "subscribed" }).lean()

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No subscribers found" }, { status: 400 })
    }

    // Send emails to all subscribers
    const emailPromises = subscribers.map((subscriber) =>
      emailService.sendNewsletter(subscriber.email, {
        subject,
        title: subject,
        subtitle: "Newsletter Update",
        body: content,
      }),
    )

    const results = await Promise.allSettled(emailPromises)
    const successful = results.filter((result) => result.status === "fulfilled").length
    const failed = results.filter((result) => result.status === "rejected").length

    return NextResponse.json({
      message: `Newsletter sent to ${successful} subscribers`,
      successful,
      failed,
      total: subscribers.length,
    })
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 })
  }
}
