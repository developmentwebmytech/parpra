import mongoose from "mongoose"

// Country Schema
const CountrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  },
  { timestamps: true },
)

// State Schema
const StateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
    countryName: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

// City & Town Schema
const CityTownSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State", required: true },
    stateName: { type: String, required: true, trim: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
    countryName: { type: String, required: true, trim: true },
    zipCode: { type: String, default: null, trim: true },
  },
  { timestamps: true },
)

// Indexes for fast lookup & unique validation
StateSchema.index({ country: 1, name: 1 }, { unique: true })
CityTownSchema.index({ state: 1, name: 1 }, { unique: true })

// Prevent model overwrite in dev
export const Country = mongoose.models.Country || mongoose.model("Country", CountrySchema)

export const State = mongoose.models.State || mongoose.model("State", StateSchema)

export const CityTown = mongoose.models.CityTown || mongoose.model("CityTown", CityTownSchema)

// This preserves your current code layout: `import { Location } from "@/lib/models/Location"`
export const Location = CityTown
