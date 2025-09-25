import mongoose from "mongoose"

// Define the schema
const BannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      trim: true,
    },
    buttonLink: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    position: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["hero", "promo", "category"],
      default: "hero",
    },
  },
  {
    timestamps: true,
  },
)

// Export the model directly as default export
const Banner = mongoose.models.Banner || mongoose.model("Banner", BannerSchema)
export default Banner
