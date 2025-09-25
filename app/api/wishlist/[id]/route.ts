import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Wishlist } from "@/lib/models/index"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Remove item from wishlist
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const itemId = id

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ user_id: userId })

    if (!wishlist) {
      return NextResponse.json({ error: "Wishlist not found" }, { status: 404 })
    }

    // Remove item from wishlist
    wishlist.items = wishlist.items.filter((item : any) => item._id.toString() !== itemId)

    await wishlist.save()

    return NextResponse.json({ message: "Item removed from wishlist" })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json({ error: "Failed to remove item from wishlist" }, { status: 500 })
  }
}
