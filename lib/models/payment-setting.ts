import mongoose, { Schema, type Document } from "mongoose"

export interface IPaymentSetting extends Document {
  cod_enabled: boolean
  cod_min_order_value: number
  cod_max_order_value: number
  online_payment_enabled: boolean
  paypal_enabled: boolean
  bank_transfer_enabled: boolean
  updatedAt: Date
}

const PaymentSettingSchema = new Schema<IPaymentSetting>(
  {
    cod_enabled: { type: Boolean, default: true },
    cod_min_order_value: { type: Number, default: 0 },
    cod_max_order_value: { type: Number, default: 10000 },
    online_payment_enabled: { type: Boolean, default: true },
    paypal_enabled: { type: Boolean, default: true },
    bank_transfer_enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.PaymentSetting || mongoose.model<IPaymentSetting>("PaymentSetting", PaymentSettingSchema)
