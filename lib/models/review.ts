import mongoose, { Schema, type Document } from "mongoose"

export interface IReview extends Document {
  product_id: mongoose.Types.ObjectId
  user_id: mongoose.Types.ObjectId
  user_name: string
  rating: number
  title: string
  comment: string
  pros?: string[]
  cons?: string[]
  helpful_votes: number
  status: "pending" | "approved" | "rejected"
  created_at: Date
  updated_at: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    pros: {
      type: [String],
      default: [],
    },
    cons: {
      type: [String],
      default: [],
    },
    helpful_votes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

// Create a compound index to ensure a user can only review a product once
ReviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true })

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)
