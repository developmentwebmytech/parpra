import mongoose, { Schema, type Document } from "mongoose"

export interface IWishlistItem {
  product_id: mongoose.Types.ObjectId
  variation_id: mongoose.Types.ObjectId
  added_at: Date
}

export interface IWishlist extends Document {
  user_id: mongoose.Types.ObjectId
  items: IWishlistItem[]
  createdAt: Date
  updatedAt: Date
}

const WishlistItemSchema = new Schema<IWishlistItem>({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variation_id: { type: mongoose.Schema.Types.ObjectId, ref: "Variation", required: true },
  added_at: { type: Date, default: Date.now },
})

const WishlistSchema = new Schema<IWishlist>(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [WishlistItemSchema],
  },
  { timestamps: true },
)

export default mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema)
