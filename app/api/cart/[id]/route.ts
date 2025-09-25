import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Cart from "@/lib/models/cart"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface Params {
  params: Promise<{
    id: string
  }>
}

// Get a specific cart item
export async function GET(request: Request, { params }: Params) {
  try {
    await connectToDatabase()
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const itemId = id

    const cart = await Cart.findOne({ user_id: userId })
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    const item = cart.items.find((item: any) => item._id.toString() === itemId)
    if (!item) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching cart item:", error)
    return NextResponse.json({ error: "Failed to fetch cart item" }, { status: 500 })
  }
}

// Update a cart item (quantity)
export async function PATCH(request: Request, { params }: Params) {
  try {
    await connectToDatabase()
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const itemId = id
    const { quantity } = await request.json()

    if (quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than 0" }, { status: 400 })
    }

    const cart = await Cart.findOne({ user_id: userId })
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === itemId)
    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 })
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity

    // Recalculate total
    cart.total = cart.items.reduce((total: number, item: any) => total + item.price * item.quantity, 0)

    await cart.save()

    return NextResponse.json({ message: "Cart item updated" })
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
  }
}

// Delete a cart item
export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectToDatabase()
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const itemId = id

    const cart = await Cart.findOne({ user_id: userId })
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    // Find the item index
    const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === itemId)
    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 })
    }

    // Remove the item
    cart.items.splice(itemIndex, 1)

    // Recalculate total
    cart.total = cart.items.reduce((total: number, item: any) => total + item.price * item.quantity, 0)

    await cart.save()

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Error removing cart item:", error)
    return NextResponse.json({ error: "Failed to remove item from cart" }, { status: 500 })
  }
}
