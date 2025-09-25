import mongoose from "mongoose"

const StoreLocationSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    cities: {
      type: String,
      required: [true, "Cities is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.StoreLocation || mongoose.model("StoreLocation", StoreLocationSchema)
