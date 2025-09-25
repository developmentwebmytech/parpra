import { Schema, type Document, models, model } from "mongoose"

export interface IContactSubmission extends Document {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: "new" | "read" | "responded"
  createdAt: Date
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "read", "responded"],
      default: "new",
    },
  },
  { timestamps: true },
)

const ContactSubmission =
  models.ContactSubmission || model<IContactSubmission>("ContactSubmission", ContactSubmissionSchema)
export default ContactSubmission
