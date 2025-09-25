import mongoose from "mongoose"

const HomepageSectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "banner",
        "featured-categories",
        "new-arrivals",
        "best-sellers",
        "featured-collections",
        "testimonials",
        "instagram-feed",
        "custom",
      ],
      required: true,
    },
    title: {
      type: String,
    },
    subtitle: {
      type: String,
    },
    image: {
      type: String,
    },
    position: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

export const HomepageSection =
  mongoose.models.HomepageSection || mongoose.model("HomepageSection", HomepageSectionSchema)
