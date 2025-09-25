import { NextResponse } from "next/server"
import { emailService } from "@/lib/services/email"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { to, type, data } = await request.json()

    if (!to || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let result
    switch (type) {
      case "order-confirmation":
        result = await emailService.sendOrderConfirmation(to, data)
        break
      case "order-shipped":
        result = await emailService.sendOrderShipped(to, data)
        break
      case "welcome":
        result = await emailService.sendWelcomeEmail(to, data)
        break
      case "password-reset":
        result = await emailService.sendPasswordReset(to, data)
        break
      case "newsletter":
        result = await emailService.sendNewsletter(to, data)
        break
      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({ message: "Email sent successfully", messageId: result.messageId })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
