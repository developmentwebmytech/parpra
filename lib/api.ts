// Client-side API functions to fetch data from the server
import type {
  Product,
  ProductListResponse,
  Category,
  CategoryWithSubcategories,
  Brand,
  MegaMenuContent,
  ReviewResponse,
  SearchResult,
  WishlistItem,
  CartItem,
} from "@/types"
import { toast } from "@/hooks/use-toast"

// Export the getBaseUrl function so it can be used in other components
export function getBaseUrl() {
  // For server-side calls, we need an absolute URL
  if (typeof window === "undefined") {
    // Use NEXT_PUBLIC_API_URL if available, otherwise default to http://localhost:3000
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  }

  // For client-side calls, we can use relative URLs
  return ""
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error || `API error: ${response.status} - ${response.statusText}`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  try {
    return await response.json()
  } catch (error) {
    console.error("Error parsing JSON response:", error)
    throw new Error("Failed to parse server response")
  }
}

// Get products with filtering, pagination, etc.
export async function getProducts(params: Record<string, any> = {}): Promise<ProductListResponse> {
  const queryParams = new URLSearchParams()

  // Add all params to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString())
    }
  })

  const url = `${getBaseUrl()}/api/products?${queryParams.toString()}`

  try {
    const response = await fetch(url)
    return handleResponse<ProductListResponse>(response)
  } catch (error) {
    console.error("Error fetching products:", error)
    return { products: [], totalProducts: 0, totalPages: 0, currentPage: 1 }
  }
}

// Search products
export async function searchProducts(query: string, limit = 5): Promise<SearchResult> {
  if (!query || query.trim().length < 2) {
      return {
      products: [],
      totalProducts: 0,
      totalPages: 0,
      currentPage: 1,
      totalResults: 0,
    }
  }

  const url = `${getBaseUrl()}/api/products/search?q=${encodeURIComponent(query)}&limit=${limit}`

  try {
    const response = await fetch(url)
    return handleResponse<SearchResult>(response)
  } catch (error) {
    console.error("Error searching products:", error)
    return {
      products: [],
      totalProducts: 0,
      totalPages: 0,
      currentPage: 1,
      totalResults: 0,
    }
  }
}

// Get a single product by slug
export async function getProductBySlug(slug: string): Promise<Product> {
  const url = `${getBaseUrl()}/api/products/${slug}`

  try {
    const response = await fetch(url)
    return handleResponse<Product>(response)
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error)
    throw error
  }
}

// Get related products
export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const url = `${getBaseUrl()}/api/products/related/${productId}?limit=${limit}`

  try {
    const response = await fetch(url)
    const data = await handleResponse<{ products: Product[] }>(response)
    return data.products || []
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error)
    return []
  }
}

// Get all categories
export async function getCategories(parentId?: string): Promise<{ categories: Category[] }> {
  const queryParams = new URLSearchParams()
  if (parentId) {
    queryParams.append("parentId", parentId)
  }

  const url = `${getBaseUrl()}/api/categories?${queryParams.toString()}`

  try {
    const response = await fetch(url)
    return handleResponse<{ categories: Category[] }>(response)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return { categories: [] }
  }
}

// Get category tree (categories with subcategories)
export async function getCategoryTree(): Promise<CategoryWithSubcategories[]> {
  const url = `${getBaseUrl()}/api/categories?withSubcategories=true`

  try {
    const response = await fetch(url)
    const data = await handleResponse<{ categories: CategoryWithSubcategories[] }>(response)
    return data.categories || []
  } catch (error) {
    console.error("Error fetching category tree:", error)
    return []
  }
}

// Get all brands
export async function getBrands(): Promise<Brand[]> {
  const url = `${getBaseUrl()}/api/brands`

  try {
    const response = await fetch(url)
    return handleResponse<Brand[]>(response)
  } catch (error) {
    console.error("Error fetching brands:", error)
    return []
  }
}

// Get mega menu content
export async function getMegaMenuContent(type: string): Promise<MegaMenuContent> {
  const url = `${getBaseUrl()}/api/mega-menu?type=${type}`

  try {
    const response = await fetch(url)
    return handleResponse<MegaMenuContent>(response)
  } catch (error) {
    console.error("Error fetching mega menu content:", error)
    return {} as MegaMenuContent
  }
}

// Get banners
export async function getBanners(): Promise<any[]> {
  const url = `${getBaseUrl()}/api/banners`

  try {
    const response = await fetch(url)
    const data = await handleResponse<{ banners: any[] }>(response)
    return data.banners || []
  } catch (error) {
    console.error("Error fetching banners:", error)
    return []
  }
}

// Get testimonials
export async function getTestimonials(): Promise<any[]> {
  const url = `${getBaseUrl()}/api/testimonials`

  try {
    const response = await fetch(url)
    const data = await handleResponse<{ testimonials: any[] }>(response)
    return data.testimonials || []
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return []
  }
}

// Get homepage sections
export async function getHomepageSections(): Promise<any[]> {
  const url = `${getBaseUrl()}/api/homepage-sections`

  try {
    const response = await fetch(url)
    const data = await handleResponse<{ sections: any[] }>(response)
    return data.sections || []
  } catch (error) {
    console.error("Error fetching homepage sections:", error)
    return []
  }
}

// Get user cart
export async function getUserCart(): Promise<{
  items: CartItem[]
  totalItems: number
  totalQuantity: number
  subtotal: number
}> {
  const url = `${getBaseUrl()}/api/cart`

  try {
    const response = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Cart API error:", response.status, errorData)
      throw new Error(errorData.error || `API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      items: data.items || [],
      totalItems: data.items?.length || 0,
      totalQuantity: data.items?.reduce((total: number, item: CartItem) => total + item.quantity, 0) || 0,
      subtotal: data.subtotal || 0,
    }
  } catch (error) {
    console.error("Error fetching user cart:", error)
    return { items: [], totalItems: 0, totalQuantity: 0, subtotal: 0 }
  }
}

// Add item to cart
export async function addToCart(productId: string, variationId: string, quantity: number): Promise<any> {
  const url = `${getBaseUrl()}/api/cart`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        variation_id: variationId,
        quantity,
      }),
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Added to cart",
      description: "Item has been added to your cart",
      variant: "success",
    })
    return result
  } catch (error) {
    console.error("Error adding to cart:", error)
    toast({
      title: "Error",
      description: "Failed to add item to cart",
      variant: "destructive",
    })
    throw new Error("Failed to add item to cart")
  }
}

// Update cart item
export async function updateCartItem(itemId: string, quantity: number): Promise<any> {
  const url = `${getBaseUrl()}/api/cart/${itemId}`

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity,
      }),
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Cart updated",
      description: "Your cart has been updated",
      variant: "success",
    })
    return result
  } catch (error) {
    console.error("Error updating cart item:", error)
    toast({
      title: "Error",
      description: "Failed to update cart item",
      variant: "destructive",
    })
    throw new Error("Failed to update cart item")
  }
}

// Remove cart item
export async function removeCartItem(itemId: string): Promise<any> {
  const url = `${getBaseUrl()}/api/cart/${itemId}`

  try {
    const response = await fetch(url, {
      method: "DELETE",
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
      variant: "success",
    })
    return result
  } catch (error) {
    console.error("Error removing cart item:", error)
    toast({
      title: "Error",
      description: "Failed to remove cart item",
      variant: "destructive",
    })
    throw new Error("Failed to remove cart item")
  }
}

// Get user wishlist
export async function getUserWishlist(): Promise<{ items: WishlistItem[]; totalItems: number }> {
  const url = `${getBaseUrl()}/api/wishlist`

  try {
    const response = await fetch(url, {
      // Add cache control to prevent stale data
      headers: {
        "Cache-Control": "no-cache",
      },
    })
    const data = await handleResponse<{ items: WishlistItem[] }>(response)
    return {
      items: data.items || [],
      totalItems: data.items?.length || 0,
    }
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return { items: [], totalItems: 0 }
  }
}

// Check if product is in wishlist
export async function isProductInWishlist(productId: string, variationId?: string): Promise<boolean> {
  try {
    const { items } = await getUserWishlist()
    return items.some((item) => item.product_id === productId && (!variationId || item.variation_id === variationId))
  } catch (error) {
    console.error("Error checking wishlist status:", error)
    return false
  }
}

// Add item to wishlist
export async function addToWishlist(productId: string, variationId: string): Promise<any> {
  const url = `${getBaseUrl()}/api/wishlist`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        variation_id: variationId,
      }),
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Added to wishlist",
      description: "Item has been added to your wishlist",
      variant: "success",
    })
    return result
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    toast({
      title: "Error",
      description: "Failed to add item to wishlist",
      variant: "destructive",
    })
    throw new Error("Failed to add item to wishlist")
  }
}

// Remove wishlist item
export async function removeWishlistItem(itemId: string): Promise<any> {
  const url = `${getBaseUrl()}/api/wishlist/${itemId}`

  try {
    const response = await fetch(url, {
      method: "DELETE",
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Item removed",
      description: "Item has been removed from your wishlist",
      variant: "success",
    })
    return result
  } catch (error) {
    console.error("Error removing wishlist item:", error)
    toast({
      title: "Error",
      description: "Failed to remove from wishlist",
      variant: "destructive",
    })
    throw new Error("Failed to remove from wishlist")
  }
}

// Toggle wishlist item (add if not in wishlist, remove if already in wishlist)
export async function toggleWishlistItem(productId: string, variationId: string): Promise<{ added: boolean }> {
  try {
    const { items } = await getUserWishlist()
    const existingItem = items.find((item) => item.product_id === productId && item.variation_id === variationId)

    if (existingItem) {
      await removeWishlistItem(existingItem._id)
      return { added: false }
    } else {
      await addToWishlist(productId, variationId)
      return { added: true }
    }
  } catch (error) {
    console.error("Error toggling wishlist item:", error)
    toast({
      title: "Error",
      description: "Failed to update wishlist",
      variant: "destructive",
    })
    throw new Error("Failed to toggle wishlist item")
  }
}

// Get user orders
export async function getUserOrders(): Promise<any[]> {
  const url = `${getBaseUrl()}/api/orders`

  try {
    const response = await fetch(url)
    const data = await handleResponse<{ orders: any[] }>(response)
    return data.orders || []
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

// Get order details
export async function getOrderDetails(orderId: string): Promise<any> {
  const url = `${getBaseUrl()}/api/orders/${orderId}`

  try {
    const response = await fetch(url)
    return handleResponse<any>(response)
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error)
    return null
  }
}

// Get order by ID (with option for admin mode)
export async function getOrderById(orderId: string, isAdmin = false): Promise<any> {
  const url = `${getBaseUrl()}/api/${isAdmin ? "admin/" : ""}orders/${orderId}`

  try {
    const response = await fetch(url)
    return handleResponse<any>(response)
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error)
    return null
  }
}

// Get admin orders with filtering, pagination, etc.
export async function getAdminOrders(params: Record<string, any> = {}): Promise<any> {
  const queryParams = new URLSearchParams()

  // Add all params to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString())
    }
  })

  const url = `${getBaseUrl()}/api/admin/orders?${queryParams.toString()}`

  try {
    const response = await fetch(url)
    return handleResponse<any>(response)
  } catch (error) {
    console.error("Error fetching admin orders:", error)
    return { orders: [], totalOrders: 0, totalPages: 0, currentPage: 1 }
  }
}

// Get admin order by ID
export async function getAdminOrderById(orderId: string): Promise<any> {
  const url = `${getBaseUrl()}/api/admin/orders/${orderId}`

  try {
    const response = await fetch(url)
    return handleResponse<any>(response)
  } catch (error) {
    console.error(`Error fetching admin order ${orderId}:`, error)
    return null
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string): Promise<any> {
  const url = `${getBaseUrl()}/api/admin/orders/${orderId}`

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        ...(trackingNumber && { tracking_number: trackingNumber }),
      }),
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Order updated",
      description: `Order status changed to ${status}`,
      variant: "success",
    })
    return result
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error)
    toast({
      title: "Error",
      description: "Failed to update order status",
      variant: "destructive",
    })
    throw new Error("Failed to update order status")
  }
}

// Create order
export async function createOrder(orderData: any): Promise<any> {
  const url = `${getBaseUrl()}/api/orders`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Order placed",
      description: "Your order has been successfully placed",
      variant: "success",
    })
    return result
  } catch (error) {
    console.error("Error creating order:", error)
    toast({
      title: "Error",
      description: "Failed to create order",
      variant: "destructive",
    })
    throw new Error("Failed to create order")
  }
}

// Get user profile
export async function getUserProfile(): Promise<any> {
  const url = `${getBaseUrl()}/api/user/profile`

  try {
    const response = await fetch(url)
    return handleResponse<any>(response)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(profileData: any): Promise<any> {
  const url = `${getBaseUrl()}/api/user/profile`

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
      variant: "success",
    })
    return result
  } catch (error) {
    console.error("Error updating user profile:", error)
    toast({
      title: "Error",
      description: "Failed to update profile",
      variant: "destructive",
    })
    throw new Error("Failed to update profile")
  }
}

// Update user password
export async function updateUserPassword(passwordData: any): Promise<any> {
  const url = `${getBaseUrl()}/api/user/password`

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully",
      variant: "success",
    })
    return result
  } catch (error) {
    console.error("Error updating password:", error)
    toast({
      title: "Error",
      description: "Failed to update password",
      variant: "destructive",
    })
    throw new Error("Failed to update password")
  }
}

// Get collections
export async function getCollections(): Promise<any[]> {
  const url = `${getBaseUrl()}/api/collections`

  try {
    const response = await fetch(url, {
      // Add cache control to prevent stale data
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      console.warn(`Collections API returned status: ${response.status}`)
      return [] // Return empty array instead of throwing
    }

    const data = await handleResponse<{ collections: any[] }>(response)
    return data.collections || []
  } catch (error) {
    // Log error but don't throw to prevent console errors
    console.warn("Error fetching collections:", error)
    return [] // Return empty array instead of throwing
  }
}

// Get collection details
export async function getCollectionBySlug(slug: string): Promise<any> {
  const url = `${getBaseUrl()}/api/collections/${slug}`

  try {
    const response = await fetch(url)
    return handleResponse<any>(response)
  } catch (error) {
    console.error(`Error fetching collection ${slug}:`, error)
    return null
  }
}

// Get product reviews
export async function getProductReviews(productSlug: string, page = 1, sort = "newest"): Promise<ReviewResponse> {
  const url = `${getBaseUrl()}/api/products/${productSlug}/reviews?page=${page}&sort=${sort}`

  try {
    const response = await fetch(url)
    return handleResponse<ReviewResponse>(response)
  } catch (error) {
    console.error(`Error fetching reviews for product ${productSlug}:`, error)
    return {
      reviews: [],
      totalReviews: 0,
      totalPages: 0,
      currentPage: 1,
      averageRating: 0,
      ratingCounts: [],
      hasReviewed: false,
    }
  }
}

// Submit a product review
export async function submitReview(
  productId: string,
  rating: number,
  title: string,
  comment: string,
  pros: string[] = [],
  cons: string[] = [],
): Promise<any> {
  const url = `${getBaseUrl()}/api/reviews`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        rating,
        title,
        comment,
        pros,
        cons,
      }),
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Review submitted",
      description: "Your review has been submitted successfully",
      variant: "success",
    })
    return result
  } catch (error) {
    console.error("Error submitting review:", error)
    toast({
      title: "Error",
      description: "Failed to submit review",
      variant: "destructive",
    })
    throw new Error("Failed to submit review")
  }
}

// Mark a review as helpful
export async function markReviewAsHelpful(reviewId: string): Promise<any> {
  const url = `${getBaseUrl()}/api/reviews`

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        review_id: reviewId,
        helpful: true,
      }),
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Feedback recorded",
      description: "Thank you for your feedback",
      variant: "success",
    })
    return result
  } catch (error) {
    console.error("Error marking review as helpful:", error)
    toast({
      title: "Error",
      description: "Failed to record feedback",
      variant: "destructive",
    })
    throw new Error("Failed to mark review as helpful")
  }
}

// Get admin reviews
export async function getAdminReviews(params: Record<string, any> = {}): Promise<any> {
  const queryParams = new URLSearchParams()

  // Add all params to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString())
    }
  })

  const url = `${getBaseUrl()}/api/admin/reviews?${queryParams.toString()}`

  try {
    const response = await fetch(url)
    return handleResponse<any>(response)
  } catch (error) {
    console.error("Error fetching admin reviews:", error)
    return { reviews: [], totalReviews: 0, totalPages: 0, currentPage: 1 }
  }
}

// Get admin review by ID
export async function getAdminReviewById(reviewId: string): Promise<any> {
  const url = `${getBaseUrl()}/api/admin/reviews/${reviewId}`

  try {
    const response = await fetch(url)
    return handleResponse<any>(response)
  } catch (error) {
    console.error(`Error fetching admin review ${reviewId}:`, error)
    return null
  }
}

// Update review status
export async function updateReviewStatus(reviewId: string, status: "pending" | "approved" | "rejected"): Promise<any> {
  const url = `${getBaseUrl()}/api/admin/reviews/${reviewId}`

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    })
    const result = await handleResponse<any>(response)
    toast({
      title: "Review updated",
      description: `Review status changed to ${status}`,
      variant: "success",
    })
    return result
  } catch (error) {
    console.error(`Error updating review ${reviewId} status:`, error)
    toast({
      title: "Error",
      description: "Failed to update review status",
      variant: "destructive",
    })
    throw new Error("Failed to update review status")
  }
}

// Server-side data fetching functions with proper caching
export async function getBannersData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/banners`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch banners: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching banners:", error)
    return { banners: [] }
  }
}

export async function getHomepageSectionsData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepage-sections`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage sections: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching homepage sections:", error)
    return { sections: [] }
  }
}

export async function getTestimonialsData() {
  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/testimonials`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    // Don't throw errors, just return empty data
    if (!res.ok) {
      console.error("Failed to fetch testimonials:", res.status)
      return { testimonials: [] }
    }

    return await res.json()
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return { testimonials: [] }
  }
}

export async function getCategoriesData() {
  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    // Don't throw errors, just return empty data
    if (!res.ok) {
      console.error("Failed to fetch categories:", res.status)
      return { categories: [] }
    }

    return await res.json()
  } catch (error) {
    console.error("Error fetching categories:", error)
    return { categories: [] }
  }
}

export async function getProductsData(params = {}) {
  const queryParams = new URLSearchParams()

  // Add any parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString())
    }
  })

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/products${queryString}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    // Don't throw errors, just return empty data
    if (!res.ok) {
      console.error("Failed to fetch products:", res.status)
      return { products: [], total: 0 }
    }

    return await res.json()
  } catch (error) {
    console.error("Error fetching products:", error)
    return { products: [], total: 0 }
  }
}

export async function getProductData(slug: string) {
  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    // Don't throw errors, just return empty data
    if (!res.ok) {
      console.error(`Failed to fetch product ${slug}:`, res.status)
      return null
    }

    return await res.json()
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error)
    return null
  }
}

export async function getNavbarCategories() {
  try {
    const response = await fetch(`/api/categories?navbar=true`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error("Failed to fetch navbar categories")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching navbar categories:", error)
    return []
  }
}
