import mongoose, { Schema, type Document } from "mongoose"

export interface IPaymentMethod extends Document {
  user_id: mongoose.Types.ObjectId
  card_type: string
  last_four: string
  expiry_month: string
  expiry_year: string
  is_default: boolean
  createdAt: Date
  updatedAt: Date
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    card_type: { type: String, required: true },
    last_four: { type: String, required: true },
    expiry_month: { type: String, required: true },
    expiry_year: { type: String, required: true },
    is_default: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.models.PaymentMethod || mongoose.model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema)
