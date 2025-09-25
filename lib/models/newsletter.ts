import mongoose from "mongoose"

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },
    source: {
      type: String,
      default: "website",
    },
    preferences: {
      promotions: { type: Boolean, default: true },
      newProducts: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
)

export const Newsletter = mongoose.models.Newsletter || mongoose.model("Newsletter", newsletterSchema)
