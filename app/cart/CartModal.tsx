"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

interface CartItem {
  _id: string;
  product_id: string;
  variation_id: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    slug: string;
  };
  variation: {
    _id: string;
    price: number;
    salePrice?: number;
    image: string;
    size: string;
    color: string;
  };
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { status } = useSession();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0)
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({})
  const [promoCode, setPromoCode] = useState("");

   useEffect(() => {
     const fetchCart = async () => {
    setLoading(true)

    if (status === "authenticated") {
      // Fetch cart from API for logged-in users
      try {
        const response = await fetch("/api/cart")

        if (!response.ok) {
          throw new Error("Failed to fetch cart")
        }

        const data = await response.json()
        setCartItems(data.items || [])
        calculateTotal(data.items || [])
      } catch (error) {
        console.error("Error fetching cart:", error)
        toast({
          title: "Error",
          description: "Failed to load cart items",
          variant: "destructive",
        })
        setCartItems([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }
  }
  if (isOpen && status === "authenticated" && cartItems.length === 0) {
    fetchCart()
  }
}, [isOpen, status, toast, cartItems.length])

 

   const calculateTotal = (items: CartItem[]) => {
    let sum = 0
    items.forEach((item) => {
      const price = item.variation.salePrice || item.variation.price
      sum += price * item.quantity
    })
    setTotal(sum)
  }

   const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return

    // Set this item as updating
    setUpdatingItems((prev) => ({ ...prev, [item._id || ""]: true }))

    try {
      const response = await fetch(`/api/cart/${item._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (!response.ok) {
        throw new Error("Failed to update quantity")
      }

      // Update local state
      const updatedItems = cartItems.map((cartItem) => {
        if (cartItem._id === item._id) {
          return { ...cartItem, quantity: newQuantity }
        }
        return cartItem
      })

      setCartItems(updatedItems)
      calculateTotal(updatedItems)
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [item._id || ""]: false }))
    }
  }

  const removeItem = async (item: CartItem) => {
    // Set this item as updating
    setUpdatingItems((prev) => ({ ...prev, [item._id || ""]: true }))

    try {
      // Use item _id for API calls
      const response = await fetch(`/api/cart/${item._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove item from cart")
      }

      // Update local state
      const updatedItems = cartItems.filter((cartItem) => cartItem._id !== item._id)
      setCartItems(updatedItems)
      calculateTotal(updatedItems)

      toast({
        title: "Item removed",
        description: "Item removed from cart",
      })
    } catch (error) {
      console.error("Error removing item from cart:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      })
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [item._id || ""]: false }))
    }
  }

  const moveToWishlist = async (item: CartItem) => {
    // Set this item as updating
    setUpdatingItems((prev) => ({ ...prev, [item._id || ""]: true }))

    try {
      // First add to wishlist
      const wishlistResponse = await fetch(`/api/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: item.product_id,
          variation_id: item.variation_id,
        }),
      })

      if (!wishlistResponse.ok) {
        const errorData = await wishlistResponse.json()
        // If item is already in wishlist, continue with removal from cart
        if (!errorData.message?.includes("already in wishlist")) {
          throw new Error("Failed to add item to wishlist")
        }
      }

      // Then remove from cart
      await removeItem(item)

      toast({
        title: "Moved to wishlist",
        description: "Item moved to your wishlist",
      })
    } catch (error) {
      console.error("Error moving item to wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to move item to wishlist",
        variant: "destructive",
      })
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [item._id || ""]: false }))
    }
  }

  const applyPromoCode = () => {
    // In a real implementation, this would validate the promo code with the server
    toast({
      title: "Promo Code",
      description: `Promo code "${promoCode}" applied!`,
    });
  };

  const subtotal = cartItems.reduce((total, item) => {
    const price = item.variation.salePrice || item.variation.price;
    return total + price * item.quantity;
  }, 0);

  const fixImagePath = (path: string) => {
    if (!path) return "/placeholder.svg";
    return path.startsWith("http") || path.startsWith("/") ? path : `/${path}`;
  };

  if (!isOpen) return null;
  // Handle unauthenticated state
if (status === "unauthenticated") {
  return (
    <div className="fixed inset-0 bg-[#0000005f] bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto py-4 px-2">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium">MY CART</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 text-center text-gray-500">You are not logged in.</div>
      </div>
    </div>
  )
}

  return (
    <div className="fixed inset-0 bg-[#0000005f] bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto py-4 px-2">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium">MY CART</h2>
          <div className="flex items-center">
            <span className="mr-4 text-gray-600">
              {cartItems.length} ITEMS IN YOUR CART
            </span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <X className="h-6 w-6 " />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Promo Code */}
          <div className="mb-6">
            <p className="font-medium mb-2">PROMOCODE?</p>
            <div className="flex">
              <Input
                type="text"
                placeholder="Enter coupon code here"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="rounded-r-none"
              />
              <Button
                className="rounded-l-none bg-teal-700 hover:bg-teal-800"
                onClick={applyPromoCode}
                disabled={!promoCode}
              >
                Apply
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-4">ORDER SUMMARY</h3>
            {loading ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4 border-b pb-4">
                    <Skeleton className="h-32 w-24" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-4" />
                      <div className="flex justify-between mt-3">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button variant="outline" onClick={onClose} className="mx-auto">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4 border-b pb-4">
                    <div className="relative h-32 w-24 flex-shrink-0">
                      <Image
                        src={fixImagePath(item.variation.image)}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 200px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={onClose}
                          className="text-sm font-medium line-clamp-2 hover:text-teal-700"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item)}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                          aria-label="Remove from cart"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Size: {item.variation.size}, Color:{" "}
                        {item.variation.color}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(item, item.quantity - 1)
                            }
                            className="px-2 py-0.5 hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item, item.quantity + 1)
                            }
                            className="px-2 py-0.5 hover:bg-gray-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-medium">
                          ₹
                          {(
                            item.variation.salePrice || item.variation.price
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <button
                        className="mt-2 text-xs text-teal-700 hover:text-teal-800 flex items-center"
                        onClick={() =>
                          moveToWishlist(
                            item
                          )
                        }
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Move to Wishlist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <>
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="space-y-4">
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full bg-teal-700 hover:bg-teal-800 mb-4">
                    Checkout
                  </Button>
                </Link>
                <Link href="/cart" onClick={onClose}>
                  <Button variant="outline" className="w-full mb-4 hover:bg-teal-600 hover:text-white ">
                    View Cart
                  </Button>
                </Link>
                <Button variant="link" onClick={onClose} className="w-full border no-underline  hover:bg-teal-600  hover:text-white">
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
