export interface Product {
  _id: string
  name: string
  description: string
  brand_id: {
    _id: string
    name: string
  }
  category_id: {
    _id: string
    name: string
  }
  material: string
  tags: string[]
  is_featured: boolean
  is_best_seller: boolean
  slug: string
  variations: Variation[]
}

export interface Variation {
  _id: string
  product_id: string
  size: string
  color: string
  price: number
  salePrice?: number
  image: string
  gallery: string[]
  sku: string
  quantity: number
}

export interface ProductListResponse {
  products: Product[]
  totalProducts: number
  totalPages: number
  currentPage: number
}

// Category types
export interface Category {
  _id: string
  name: string
  image: string | null
  description?: string
  parent_category_id: string | null
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[]
}

// Brand types
export interface Brand {
  _id: string
  name: string
  image: string | null
}

// Mega menu types
export interface MegaMenuItem {
  title: string
  url: string
}

export interface MegaMenuSection {
  title: string
  items: MegaMenuItem[]
}

export interface MegaMenuContent {
  sections: MegaMenuSection[]
  featuredImage?: string
}

// User types
export interface User {
  _id: string
  name: string
  email: string
  role: "user" | "admin"
}

// Cart types
export interface CartItem {
  _id: string
  product_id: string
  variation_id: string
  quantity: number
  price: number
  name: string
  image: string
  size: string
  color: string
}

export interface Cart {
  _id: string
  user_id: string
  items: CartItem[]
  total: number
}

// Order types
export interface Order {
  _id: string
  user_id: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shipping_address: Address
  billing_address: Address
  payment_method: string
  payment_status: "pending" | "paid" | "failed"
  created_at: string
  updated_at: string
}

export interface Address {
  full_name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
}


// Review types
export interface Review {
  _id: string
  product_id: string
  user_id: string
  user_name: string
  rating: number
  title: string
  comment: string
  pros?: string[]
  cons?: string[]
  helpful_votes: number
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface ReviewResponse {
  reviews: Review[]
  totalReviews: number
  totalPages: number
  currentPage: number
  averageRating: number
  ratingCounts: { rating: number; count: number }[]
  hasReviewed: boolean
}

export interface SearchResult  {
  products: Product[]
  totalProducts: number
  totalPages: number
  currentPage: number
  totalResults: number
}

export interface WishlistItem {
  _id: string
  product_id: string
  variation_id: string
}