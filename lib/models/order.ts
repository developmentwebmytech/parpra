import mongoose, { Schema, type Document } from "mongoose"

export interface OrderDocument extends Document {
  user_id: mongoose.Types.ObjectId
  order_number: string
  items: {
    product_id: mongoose.Types.ObjectId
    variation_id: mongoose.Types.ObjectId
    quantity: number
    price: number
    name: string
    image: string
    size: string
    color: string
  }[]
  total: number
  subtotal: number
  discount: number
  coupon_code?: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned"
  additionalComments:string
  shipping_address: {
    full_name: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone: string
  }
  billing_address: {
    full_name: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone: string
  }
  payment_method: "cod" | "phonepe" | "credit-card" | "paypal" | "bank-transfer"
  payment_status: "pending" | "processing" | "completed" | "failed" | "refunded"
  tracking_number?: string
  shipping_carrier?: string
  estimated_delivery?: Date
  createdAt: Date
  updatedAt: Date
}

const OrderSchema: Schema<OrderDocument> = new Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order_number: { type: String, required: true, unique: true },
    items: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        variation_id: { type: mongoose.Schema.Types.ObjectId, ref: "Variation", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        name: { type: String, required: true },
        image: { type: String },
        size: { type: String },
        color: { type: String },
      },
    ],
    total: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    coupon_code: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    additionalComments:{
      type:String,
    },
    shipping_address: {
      full_name: { type: String, required: true },
      address_line1: { type: String, required: true },
      address_line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postal_code: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    billing_address: {
      full_name: { type: String, required: true },
      address_line1: { type: String, required: true },
      address_line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postal_code: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    payment_method: {
      type: String,
      enum: ["cod", "phonepe", "credit-card", "paypal", "bank-transfer"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    tracking_number: { type: String },
    shipping_carrier: { type: String },
    estimated_delivery: { type: Date },
  },
  {
    timestamps: true,
  }
)

// Create indexes
OrderSchema.index({ user_id: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ payment_status: 1 })
OrderSchema.index({ createdAt: -1 })

const Order = mongoose.models.Order || mongoose.model<OrderDocument>("Order", OrderSchema)

export { Order }
