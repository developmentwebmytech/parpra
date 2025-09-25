import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import ContactInfo from "@/lib/models/ContactInfo"

// Initial contact information data
const initialContactInfo = [
  {
    type: "address",
    title: "Visit Us",
    content: {
      line1: "123 Fashion Street, Suite 100",
      line2: "New Delhi, 110001",
      line3: "India",
      mapUrl: "https://maps.google.com",
    },
    icon: "MapPin",
    order: 1,
  },
  {
    type: "phone",
    title: "Call Us",
    content: {
      "Customer Service": "+91 123 456 7890",
      "Order Support": "+91 123 456 7891",
    },
    icon: "Phone",
    order: 2,
  },
  {
    type: "email",
    title: "Email Us",
    content: {
      "General Inquiries": "info@yourfashionstore.com",
      "Customer Support": "support@yourfashionstore.com",
    },
    icon: "Mail",
    order: 3,
  },
  {
    type: "hours",
    title: "Business Hours",
    content: {
      "Monday - Friday": "10:00 AM - 7:00 PM",
      Saturday: "11:00 AM - 6:00 PM",
      Sunday: "Closed",
    },
    icon: "Clock",
    order: 4,
  },
]

export async function GET() {
  try {
    await connectToDatabase()

    // Check if the ContactInfo collection is empty
    const count = await ContactInfo.countDocuments()

    if (count === 0) {
      // If empty, insert the initial data
      await ContactInfo.insertMany(initialContactInfo)
      return NextResponse.json({
        success: true,
        message: "Database seeded with initial contact information",
        count: initialContactInfo.length,
      })
    } else {
      return NextResponse.json({ success: true, message: "Database already has contact information", count })
    }
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, error: "Failed to seed database" }, { status: 500 })
  }
}
