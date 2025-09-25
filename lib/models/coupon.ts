import mongoose, { Schema, type Document } from "mongoose"

export interface ICoupon extends Document {
  code: string
  description: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  minimum_purchase: number
  start_date: Date
  expiry_date: Date
  usage_limit: number
  usage_count: number
  is_active: boolean
  applies_to: "all" | "categories" | "products"
  applicable_categories?: mongoose.Types.ObjectId[]
  applicable_products?: mongoose.Types.ObjectId[]
  created_at: Date
  updated_at: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
      min: 0,
    },
    minimum_purchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    usage_limit: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    usage_count: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    applies_to: {
      type: String,
      enum: ["all", "categories", "products"],
      default: "all",
    },
    applicable_categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    applicable_products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
)

export default mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema)
