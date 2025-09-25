import { Schema, type Document, models, model } from "mongoose"

export interface IShippingMethod {
  name: string
  time: string
  cost: string
  icon: string
}

export interface IShippingInfo extends Document {
  type:
    | "domestic"
    | "international"
    | "return-eligibility"
    | "non-returnable"
    | "return-process"
    | "refunds"
    | "exchanges"
    | "damaged"
  title: string
  content: string
  items?: string[]
  methods?: IShippingMethod[]
  order: number
  lastUpdated: Date
}

const ShippingMethodSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  cost: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
})

const ShippingInfoSchema = new Schema<IShippingInfo>(
  {
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: [
        "domestic",
        "international",
        "return-eligibility",
        "non-returnable",
        "return-process",
        "refunds",
        "exchanges",
        "damaged",
      ],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: false,
      trim: true,
    },
    items: {
      type: [String],
      required: false,
    },
    methods: {
      type: [ShippingMethodSchema],
      required: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const ShippingInfo = models.ShippingInfo || model<IShippingInfo>("ShippingInfo", ShippingInfoSchema)
export default ShippingInfo
