import mongoose from "mongoose"

const MegaMenuItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
})

const MegaMenuSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  items: [MegaMenuItemSchema],
})

const MegaMenuConfigSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,
    },
    sections: [MegaMenuSectionSchema],
    featuredImage: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export const MegaMenuConfig = mongoose.models.MegaMenuConfig || mongoose.model("MegaMenuConfig", MegaMenuConfigSchema)
