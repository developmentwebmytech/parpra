import { connectToDatabase } from "@/lib/mongodb"
import { Brand, Category, Product, Variation, User } from "@/lib/models"
import { isValidObjectId } from "mongoose"

// Helper function to serialize MongoDB documents
function serialize(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

// Stats for dashboard
export async function getStats() {
  await connectToDatabase()

  const [
    totalProducts,
    totalCategories,
    totalBrands,
    totalVariations,
    totalUsers,
    newProducts,
    newCategories,
    newBrands,
    newVariations,
    newUsers,
  ] = await Promise.all([
    Product.countDocuments({}),
    Category.countDocuments({}),
    Brand.countDocuments({}),
    Variation.countDocuments({}),
    User.countDocuments({}),
    Product.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    Category.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    Brand.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    Variation.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
  ])

  return {
    totalProducts,
    totalCategories,
    totalBrands,
    totalVariations,
    totalUsers,
    newProducts,
    newCategories,
    newBrands,
    newVariations,
    newUsers,
  }
}

// Update the getBrands function to handle name filter
export async function getBrands({ page = 1, per_page = 10, name = "" }) {
  await connectToDatabase()

  const skip = (page - 1) * per_page

  // Build query based on filters
  const query: any = {}
  if (name) {
    query.name = { $regex: name, $options: "i" }
  }

  const [brands, totalBrands] = await Promise.all([
    Brand.find(query).sort({ createdAt: -1 }).skip(skip).limit(per_page).lean(),
    Brand.countDocuments(query),
  ])

  const totalPages = Math.ceil(totalBrands / per_page)

  return {
    brands: serialize(brands),
    totalPages,
  }
}

// Get brand by ID
export async function getBrandById(id: string) {
  if (!isValidObjectId(id)) return null

  await connectToDatabase()

  const brand = await Brand.findById(id).lean()

  return brand ? serialize(brand) : null
}

// Update the getCategories function to handle name and parent_id filters
export async function getCategories({ page = 1, per_page = 10, name = "", parent_id = "" }) {
  await connectToDatabase()

  const skip = (page - 1) * per_page

  // Build query based on filters
  const query: any = {}
  if (name) {
    query.name = { $regex: name, $options: "i" }
  }

  if (parent_id) {
    if (parent_id === "none") {
      query.parent_category_id = null
    } else {
      query.parent_category_id = parent_id
    }
  }

  const [categories, totalCategories] = await Promise.all([
    Category.find(query)
      .populate("parent_category_id", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(per_page)
      .lean(),
    Category.countDocuments(query),
  ])

  const totalPages = Math.ceil(totalCategories / per_page)

  return {
    categories: serialize(categories),
    totalPages,
  }
}

// Get category by ID
export async function getCategoryById(id: string) {
  if (!isValidObjectId(id)) return null

  await connectToDatabase()

  const category = await Category.findById(id).populate("parent_category_id", "name").lean()

  return category ? serialize(category) : null
}

// Update the getProducts function to handle all filters
export async function getProducts({ page = 1, per_page = 10, name = "", brand_id = "", category_id = "", date = "" }) {
  await connectToDatabase()

  const skip = (page - 1) * per_page

  // Build query based on filters
  const query: any = {}

  if (name) {
    query.name = { $regex: name, $options: "i" }
  }

  if (brand_id) {
    query.brand_id = brand_id
  }

  if (category_id) {
    query.category_id = category_id
  }

  if (date) {
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    }
  }

  const [products, totalProducts] = await Promise.all([
    Product.find(query)
      .populate("brand_id", "name")
      .populate("category_id", "name")
      .populate({
        path: "variations",
        select: "image gallery",
        options: { limit: 1 }, // Get only the first variation for the image
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(per_page)
      .lean(),
    Product.countDocuments(query),
  ])

  const totalPages = Math.ceil(totalProducts / per_page)

  return {
    products: serialize(products),
    totalPages,
  }
}

// Get product by ID
export async function getProductById(id: string) {
  if (!isValidObjectId(id)) return null

  await connectToDatabase()

  const product = await Product.findById(id).populate("brand_id", "name").populate("category_id", "name").lean()

  return product ? serialize(product) : null
}

// Get variations by product ID with pagination
export async function getVariationsByProductId(productId: string, { page = 1, per_page = 10 }) {
  if (!isValidObjectId(productId)) return { variations: [], totalPages: 0 }

  await connectToDatabase()

  const skip = (page - 1) * per_page

  const [variations, totalVariations] = await Promise.all([
    Variation.find({ product_id: productId }).sort({ createdAt: -1 }).skip(skip).limit(per_page).lean(),
    Variation.countDocuments({ product_id: productId }),
  ])

  const totalPages = Math.ceil(totalVariations / per_page)

  return {
    variations: serialize(variations),
    totalPages,
  }
}

// Get variation by ID
export async function getVariationById(id: string) {
  if (!isValidObjectId(id)) return null

  await connectToDatabase()

  const variation = await Variation.findById(id).populate("product_id", "name").lean()

  return variation ? serialize(variation) : null
}

// Get users with pagination and filters
export async function getUsers({ page = 1, per_page = 10, name = "", email = "" }) {
  await connectToDatabase()

  const skip = (page - 1) * per_page

  // Build query based on filters
  const query: any = {}

  if (name) {
    query.name = { $regex: name, $options: "i" }
  }

  if (email) {
    query.email = { $regex: email, $options: "i" }
  }

  const [users, totalUsers] = await Promise.all([
    User.find(query)
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(per_page)
      .lean(),
    User.countDocuments(query),
  ])

  const totalPages = Math.ceil(totalUsers / per_page)

  return {
    users: serialize(users),
    totalPages,
  }
}

// Get user by ID
export async function getUserById(id: string) {
  if (!isValidObjectId(id)) return null

  await connectToDatabase()

  const user = await User.findById(id).select("-password").lean()

  return user ? serialize(user) : null
}
