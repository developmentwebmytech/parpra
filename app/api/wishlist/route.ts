import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product, Variation } from "@/lib/models";
import Wishlist from "@/lib/models/wishlist";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { IProduct } from "@/lib/models";

// Get user's wishlist
export async function GET() {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user_id: userId });

    if (!wishlist) {
      wishlist = { user_id: userId, items: [] };
    }

    // Populate product details
    const populatedItems = [];

    for (const item of wishlist.items) {
      try {
        const product : any = await Product.findById<IProduct>(
          item.product_id
        ).lean();
        const variation: any = await Variation.findById(
          item.variation_id
        ).lean();

        if (product && variation) {
          populatedItems.push({
            _id: item._id.toString(),
            product_id: item.product_id.toString(),
            variation_id: item.variation_id.toString(),
            added_at: item.added_at,
            product: {
              _id: product._id.toString(),
              name: product.name,
              slug: product.slug,
              description: product.description || "",
            },
            variation: {
              _id: variation._id.toString(),
              price: variation.price,
              salePrice: variation.salePrice,
              image: variation.image,
              size: variation.size,
              color: variation.color,
              quantity: variation.quantity,
            },
          });
        }
      } catch (err) {
        console.error("Error fetching product or variation:", err);
      }
    }

    // Make sure the response includes the total count
    return NextResponse.json({
      items: populatedItems,
      totalItems: populatedItems.length,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// Add item to wishlist
export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { product_id, variation_id } = await request.json();

    if (!product_id || !variation_id) {
      return NextResponse.json(
        { error: "Product ID and Variation ID are required" },
        { status: 400 }
      );
    }

    // Validate product and variation exist
    const product = await Product.findById(product_id);
    const variation = await Variation.findById(variation_id);

    if (!product || !variation) {
      return NextResponse.json(
        { error: "Product or variation not found" },
        { status: 404 }
      );
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user_id: userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        user_id: new mongoose.Types.ObjectId(userId),
        items: [],
      });
    }

    // Check if item already exists in wishlist
    const existingItem = wishlist.items.find(
      (item : any) =>
        item.product_id.toString() === product_id &&
        item.variation_id.toString() === variation_id
    );

    if (existingItem) {
      return NextResponse.json({ message: "Item already in wishlist" });
    }

    // Add item to wishlist
    wishlist.items.push({
      product_id: new mongoose.Types.ObjectId(product_id),
      variation_id: new mongoose.Types.ObjectId(variation_id),
      added_at: new Date(),
    });

    await wishlist.save();

    return NextResponse.json({ message: "Item added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add item to wishlist" },
      { status: 500 }
    );
  }
}
