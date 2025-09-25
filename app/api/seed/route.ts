import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Faq from "@/lib/models/Faq"

// Initial FAQs data from your component
const initialFaqs = [
  {
    question: "How do I track my order?",
    answer:
      "You can track your order by logging into your account and visiting the 'My Orders' section. Click on the specific order to view its current status and tracking information.",
    category: "Orders",
  },
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 7 days of delivery for unworn items in their original packaging. Please note that customized items cannot be returned unless there's a manufacturing defect.",
    category: "Returns",
  },
  {
    question: "How do I know which size to order?",
    answer:
      "Each product page includes a detailed size chart. We recommend measuring yourself and comparing with our size chart to find the best fit. If you're between sizes, we suggest sizing up.",
    category: "Sizing",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries worldwide. International shipping typically takes 7-14 business days depending on the destination. Customs duties and taxes may apply and are the responsibility of the customer.",
    category: "Shipping",
  },
  {
    question: "How can I cancel my order?",
    answer:
      "You can cancel your order within 24 hours of placing it by contacting our customer service team. Once the order has been processed or shipped, it cannot be cancelled, but you can return it according to our return policy.",
    category: "Orders",
  },
  {
    question: "Are the colors of the products accurate in the photos?",
    answer:
      "We make every effort to display the colors of our products accurately, but colors may appear differently on different screens. If you're concerned about the exact shade, please contact our customer service team.",
    category: "Products",
  },
  {
    question: "How do I care for my ethnic wear?",
    answer:
      "Most of our ethnic wear requires dry cleaning only. For specific care instructions, please refer to the product description or the care label attached to the garment.",
    category: "Products",
  },
  {
    question: "Can I modify my order after placing it?",
    answer:
      "Order modifications are possible within 12 hours of placing the order, subject to processing status. Please contact our customer service team immediately if you need to make changes.",
    category: "Orders",
  },
  {
    question: "Do you offer customization services?",
    answer:
      "Yes, we offer customization for select products. Options include size adjustments, color variations, and embroidery modifications. Customization may extend the delivery time by 7-14 days.",
    category: "Products",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept credit/debit cards, net banking, UPI, wallets, and cash on delivery (for orders within India). All online payments are processed through secure payment gateways.",
    category: "Payment",
  },
  {
    question: "How long will it take to receive my order?",
    answer:
      "Domestic orders typically take 3-5 business days for delivery. For international orders, delivery times range from 7-14 business days depending on the destination country.",
    category: "Shipping",
  },
  {
    question: "What if my order arrives damaged?",
    answer:
      "If your order arrives damaged, please contact our customer service team within 24 hours of delivery with photos of the damaged items. We'll arrange for a replacement or refund.",
    category: "Returns",
  },
]

export async function GET() {
  try {
    await connectToDatabase()

    // Check if the FAQs collection is empty
    const count = await Faq.countDocuments()

    if (count === 0) {
      // If empty, insert the initial data
      await Faq.insertMany(initialFaqs)
      return NextResponse.json({
        success: true,
        message: "Database seeded with initial FAQ data",
        count: initialFaqs.length,
      })
    } else {
      return NextResponse.json({ success: true, message: "Database already has FAQ data", count })
    }
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, error: "Failed to seed database" }, { status: 500 })
  }
}
