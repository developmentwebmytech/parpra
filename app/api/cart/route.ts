import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import {  Product, Variation } from "@/lib/models"
import Cart from "@/lib/models/cart"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Get user's cart
export async function GET() {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Find or create cart
    let cart: any = await Cart.findOne({ user_id: userId }).lean()

    if (!cart) {
      cart = { user_id: userId, items: [], total: 0 }
    }

    // Populate product details
    const populatedItems = []

    for (const item of cart.items) {
      try {
        const product: any = await Product.findById(item.product_id).lean()
        const variation: any  = await Variation.findById(item.variation_id).lean()

        if (product && variation) {
          populatedItems.push({
            _id: item._id.toString(),
            product_id: item.product_id.toString(),
            variation_id: item.variation_id.toString(),
            quantity: item.quantity,
            price: item.price,
            added_at: item.added_at,
            product: {
              _id: product._id.toString(),
              name: product.name,
              slug: product.slug,
            },
            variation: {
              _id: variation._id.toString(),
              price: variation.price,
              salePrice: variation.salePrice,
              image: variation.image,
              size: variation.size,
              color: variation.color,
            },
          })
        }
      } catch (err) {
        console.error("Error fetching product or variation:", err)
      }
    }

    return NextResponse.json({
      _id: cart._id?.toString(),
      user_id: cart.user_id.toString(),
      items: populatedItems,
      total: cart.total,
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

// Add item to cart
export async function POST(request: Request) {

  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { product_id, variation_id, quantity = 1 } = await request.json()
   
    if (!product_id || !variation_id) {
      return NextResponse.json({ error: "Product ID and Variation ID are required" }, { status: 400 })
    }

    // Validate product and variation exist
    const product = await Product.findById(product_id)
    const variation = await Variation.findById(variation_id)

    if (!product || !variation) {
      return NextResponse.json({ error: "Product or variation not found" }, { status: 404 })
    }

    // Check if quantity is valid
    if (quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than 0" }, { status: 400 })
    }

    if (quantity > variation.quantity) {
      return NextResponse.json({ error: "Not enough stock available" }, { status: 400 })
    }

    // Find or create cart
    let cart = await Cart.findOne({ user_id: userId })

    if (!cart) {
      cart = new Cart({
        user_id: new mongoose.Types.ObjectId(userId),
        items: [],
        total: 0,
      })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product_id.toString() === product_id && item.variation_id.toString() === variation_id,
    )

    const price = variation.salePrice || variation.price

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity
      cart.items[existingItemIndex].price = price

      // Check if new quantity exceeds stock
      if (cart.items[existingItemIndex].quantity > variation.quantity) {
        return NextResponse.json({ error: "Not enough stock available" }, { status: 400 })
      }
    } else {
      // Add new item to cart
      cart.items.push({
        product_id: new mongoose.Types.ObjectId(product_id),
        variation_id: new mongoose.Types.ObjectId(variation_id),
        quantity,
        price,
        added_at: new Date(),
      })
    }

    // Recalculate total
    cart.total = cart.items.reduce((total: number, item: any) => total + item.price * item.quantity, 0)

    await cart.save()

    return NextResponse.json({ message: "Item added to cart" })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 })
  }
}
