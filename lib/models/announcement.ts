import mongoose, { Schema, type Document } from "mongoose"

export interface IAnnouncement extends Document {
  text: string
  link?: string
  isActive: boolean
  backgroundColor?: string
  textColor?: string
  position: number
  createdAt: Date
  updatedAt: Date
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    text: { type: String, required: true },
    link: { type: String },
    isActive: { type: Boolean, default: true },
    backgroundColor: { type: String, default: "#064e3b" }, // Default to teal-900
    textColor: { type: String, default: "#ffffff" }, // Default to white
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema)
