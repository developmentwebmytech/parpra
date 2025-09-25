import mongoose, { Schema, type Document } from "mongoose"

export interface IAddress extends Document {
        user_id: mongoose.Types.ObjectId
        full_name: string
        address_line1: string
        address_line2?: string
        city: string
        state: string
        postal_code: string
        country: string
        phone: string
        is_default: boolean
        createdAt: Date
        updatedAt: Date
}

const AddressSchema = new Schema<IAddress>(
        {
                user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                full_name: { type: String, required: true },
                address_line1: { type: String, required: true },
                address_line2: { type: String },
                city: { type: String, required: true },
                state: { type: String, required: true },
                postal_code: { type: String, required: true },
                country: { type: String, required: true },
                phone: { type: String, required: true },
                is_default: { type: Boolean, default: false },
        },
        { timestamps: true },
)

export default mongoose.models.Address || mongoose.model<IAddress>("Address", AddressSchema)
