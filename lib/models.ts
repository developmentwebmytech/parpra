import mongoose, { Schema, type Document } from "mongoose"

// User Interface
interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  role: "admin" | "user"
  createdAt: Date
  updatedAt: Date
}

// Brand Interface
interface IBrand extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

// Category Interface
interface ICategory extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  image: string | null
  parent_category_id: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

// Product Interface
interface IProduct extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  description: string
  brand_id: mongoose.Types.ObjectId
  category_id: mongoose.Types.ObjectId
  material: string
  tags: string[]
  is_featured: boolean
  is_best_seller: boolean
  variations: mongoose.Types.ObjectId[]
  slug: string
  createdAt: Date
  updatedAt: Date
}

// Variation Interface
interface IVariation extends Document {
  _id: mongoose.Types.ObjectId
  product_id: mongoose.Types.ObjectId
  size: "XS" | "S" | "M" | "L" | "XL" | "XXL"
  color: string
  price: number
  salePrice?: number
  image?: string
  gallery?: string[]
  sku: string
  quantity: number
  createdAt: Date
  updatedAt: Date
}

// User Schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true },
)

// Brand Schema
const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String, default: null },
  },
  { timestamps: true },
)

// Category Schema
const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, unique: true, required: true },
    image: { type: String, default: null },
    parent_category_id: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true },
)

// Product Schema
const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    brand_id: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    material: String,
    tags: [String],
    is_featured: { type: Boolean, default: false },
    is_best_seller: { type: Boolean, default: false },
    variations: [{ type: Schema.Types.ObjectId, ref: "Variation" }],
    slug: { type: String, unique: true, required: true },
  },
  { timestamps: true },
)

// Variation Schema
const VariationSchema = new Schema<IVariation>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    size: {
      type: String,
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    color: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
    },
    image: {
      type: String,
    },
    gallery: [String],
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// Create or retrieve models
export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
export const Brand = mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema)
export const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)
export const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
export const Variation = mongoose.models.Variation || mongoose.model<IVariation>("Variation", VariationSchema)

// Export interfaces
export type { IUser, IBrand, ICategory, IProduct, IVariation }


