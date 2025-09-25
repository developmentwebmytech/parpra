"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import AuthPopup from "@/components/auth-popup";

interface CartItem {
  _id: string;
  product_id: string;
  variation_id: string;
  quantity: number;
  price: number;
  added_at: string;
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

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
    {}
  );
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      const data = await response.json();
      setCartItems(data.items || []);
      calculateSubtotal(data.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
    if (status === "unauthenticated") {
      // Redirect to login if not authenticated
      setIsAuthModalOpen(true);
    } else if (status === "authenticated") {
      fetchCart();
    }
  }, [status, toast]);

  

  const calculateSubtotal = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => {
      const price = item.variation.salePrice || item.variation.price;
      return sum + price * item.quantity;
    }, 0);
    setSubtotal(total);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Set this item as updating
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      // Update local state
      const updatedItems = cartItems.map((item) => {
        if (item._id === itemId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      setCartItems(updatedItems);
      calculateSubtotal(updatedItems);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId: string) => {
    // Set this item as updating
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      const updatedItems = cartItems.filter((item) => item._id !== itemId);
      setCartItems(updatedItems);
      calculateSubtotal(updatedItems);

      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const moveToWishlist = async (item: CartItem) => {
    // Set this item as updating
    setUpdatingItems((prev) => ({ ...prev, [item._id]: true }));

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
      });

      if (!wishlistResponse.ok) {
        const errorData = await wishlistResponse.json();
        // If item is already in wishlist, continue with removal from cart
        if (!errorData.message?.includes("already in wishlist")) {
          throw new Error("Failed to add item to wishlist");
        }
      }

      // Then remove from cart
      await removeItem(item._id);

      toast({
        title: "Moved to wishlist",
        description: "Item moved to your wishlist",
      });
    } catch (error) {
      console.error("Error moving item to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to move item to wishlist",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const response = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponError(data.error || "Invalid coupon code");
        setDiscount(0);
        return;
      }

      setCouponSuccess(`Coupon applied! You saved ₹${data.discount}`);
      setDiscount(data.discount);
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError("Failed to apply coupon");
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add items before checkout.",
        variant: "destructive",
      });
      return;
    }

    router.push("/checkout");
  };

  // Fix image paths if needed
  const fixImagePath = (path: string) => {
    if (!path) return "/placeholder.svg";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `/${path}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-700"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingBag className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button
              onClick={() => router.push("/products")}
              className="bg-teal-700 hover:bg-teal-800"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items Section */}
            <div className="lg:w-2/3 w-full">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">
                    Cart Items ({cartItems.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 flex flex-col sm:flex-row gap-4"
                    >
                      <div className="sm:w-1/4 w-full">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="block relative aspect-square rounded overflow-hidden"
                        >
                          <Image
                            src={
                              fixImagePath(item.variation.image) ||
                              "/placeholder.svg"
                            }
                            alt={item.product.name}
                            fill
                            className="object-contain"
                          />
                        </Link>
                      </div>
                      <div className="sm:w-3/4 w-full flex flex-col">
                        <div className="flex justify-between items-start mb-2 flex-wrap">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-lg font-medium hover:text-teal-700"
                          >
                            {item.product.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <button
                              onClick={() => moveToWishlist(item)}
                              className="text-gray-500 hover:text-red-500"
                              disabled={updatingItems[item._id]}
                            >
                              <Heart className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => removeItem(item._id)}
                              className="text-gray-500 hover:text-red-500"
                              disabled={updatingItems[item._id]}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          {item.variation.color}, {item.variation.size}
                        </div>

                        <div className="mt-auto flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center border rounded">
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={
                                item.quantity <= 1 || updatingItems[item._id]
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-1">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={updatingItems[item._id]}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center">
                            {updatingItems[item._id] && (
                              <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-teal-700 rounded-full mr-2"></div>
                            )}
                            <div className="text-lg font-semibold">
                              {item.variation.salePrice ? (
                                <>
                                  ₹{item.variation.salePrice * item.quantity}
                                  <span className="text-sm text-gray-500 line-through ml-2">
                                    ₹{item.variation.price * item.quantity}
                                  </span>
                                </>
                              ) : (
                                <span>
                                  ₹{item.variation.price * item.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:w-1/3 w-full">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t pt-4 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{(subtotal - discount).toLocaleString()}</span>
                  </div>

                  <div className="pt-4">
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <Button
                        onClick={applyCoupon}
                        disabled={couponLoading}
                        className="bg-teal-700 hover:bg-teal-800"
                      >
                        {couponLoading ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-sm">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="text-green-500 text-sm">{couponSuccess}</p>
                    )}
                  </div>

                  <Button
                    onClick={proceedToCheckout}
                    className="w-full bg-teal-700 hover:bg-teal-800"
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/products")}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthPopup
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </>
  );
}
