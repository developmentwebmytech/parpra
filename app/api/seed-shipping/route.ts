import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import ShippingInfo from "@/lib/models/ShippingInfo"

// Initial shipping information data
const initialShippingInfo = [
  {
    type: "domestic",
    title: "Domestic Shipping",
    content: "We offer reliable domestic shipping options across India.",
    methods: [
      {
        name: "Standard Shipping",
        time: "3-5 business days",
        cost: "₹99 for orders under ₹999, free for orders above ₹999",
        icon: "Truck",
      },
      {
        name: "Express Shipping",
        time: "1-2 business days",
        cost: "₹199",
        icon: "Plane",
      },
    ],
    order: 1,
    lastUpdated: new Date(),
  },
  {
    type: "international",
    title: "International Shipping",
    content: "We ship to select countries worldwide.",
    methods: [
      {
        name: "Standard International",
        time: "7-14 business days",
        cost: "₹1499 for orders under ₹10,000, ₹999 for orders above ₹10,000",
        icon: "Globe",
      },
      {
        name: "Express International",
        time: "3-5 business days",
        cost: "₹2499",
        icon: "Plane",
      },
    ],
    order: 2,
    lastUpdated: new Date(),
  },
  {
    type: "return-eligibility",
    title: "Return Eligibility",
    content: "You may return items purchased from PARPRA within 7 days of delivery if:",
    items: [
      "The item is unworn, unwashed, and unaltered",
      "The item is in its original packaging with all tags attached",
      "You have the original receipt or proof of purchase",
    ],
    order: 3,
    lastUpdated: new Date(),
  },
  {
    type: "non-returnable",
    title: "Non-Returnable Items",
    content: "The following items cannot be returned:",
    items: [
      "Customized or personalized products",
      "Intimate wear for hygiene reasons",
      'Sale items marked as "Final Sale"',
      "Items damaged due to customer misuse",
    ],
    order: 4,
    lastUpdated: new Date(),
  },
  {
    type: "return-process",
    title: "Return Process",
    content: "Follow these steps to return your items:",
    items: [
      '<strong>Initiate Return:</strong> Log into your account and go to "My Orders." Select the order and items you wish to return and follow the prompts to initiate the return process.',
      "<strong>Packaging:</strong> Pack the item(s) securely in their original packaging along with all tags and accessories.",
      "<strong>Shipping:</strong> For domestic returns, you can use our prepaid return label or arrange your own shipping. For international returns, customers are responsible for return shipping costs.",
      "<strong>Processing:</strong> Once we receive your return, we'll inspect the item and process your refund within 7-10 business days.",
    ],
    order: 5,
    lastUpdated: new Date(),
  },
  {
    type: "refunds",
    title: "Refunds",
    content: "Refunds will be issued to the original payment method used for the purchase:",
    items: [
      "Credit/Debit Card refunds: 5-7 business days",
      "Bank transfers: 7-10 business days",
      "Store credit: Immediately available after return approval",
    ],
    order: 6,
    lastUpdated: new Date(),
  },
  {
    type: "exchanges",
    title: "Exchanges",
    content:
      "If you'd like to exchange an item for a different size or color, please follow the return process and place a new order for the desired item. This ensures you get the item you want without delay.",
    order: 7,
    lastUpdated: new Date(),
  },
  {
    type: "damaged",
    title: "Damaged or Defective Items",
    content:
      "If you receive a damaged or defective item, please contact our customer service team within 48 hours of delivery with photos of the damage. We'll arrange for a replacement or refund at no additional cost to you.",
    order: 8,
    lastUpdated: new Date(),
  },
]

export async function GET() {
  try {
    await connectToDatabase()

    // Check if the ShippingInfo collection is empty
    const count = await ShippingInfo.countDocuments()

    if (count === 0) {
      // If empty, insert the initial data
      await ShippingInfo.insertMany(initialShippingInfo)
      return NextResponse.json({
        success: true,
        message: "Database seeded with initial shipping information",
        count: initialShippingInfo.length,
      })
    } else {
      return NextResponse.json({ success: true, message: "Database already has shipping information", count })
    }
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, error: "Failed to seed database" }, { status: 500 })
  }
}
