import mongoose, { Schema, type Document } from "mongoose"

export interface ICartItem {
  product_id: mongoose.Types.ObjectId
  variation_id: mongoose.Types.ObjectId
  quantity: number
  price: number
  added_at: Date
}

export interface ICart extends Document {
  user_id: mongoose.Types.ObjectId
  items: ICartItem[]
  total: number
  createdAt: Date
  updatedAt: Date
}

const CartItemSchema = new Schema<ICartItem>({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variation_id: { type: mongoose.Schema.Types.ObjectId, ref: "Variation", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  added_at: { type: Date, default: Date.now },
})

const CartSchema = new Schema<ICart>(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [CartItemSchema],
    total: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema)
