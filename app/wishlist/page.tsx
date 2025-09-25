"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import UserAccountSidebar from "@/components/user-account-sidebar";
import { useSession } from "next-auth/react";

interface WishlistItem {
  _id: string;
  product_id: string;
  variation_id: string;
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

export default function WishlistPage() {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wishlist");

      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }

      const data = await response.json();
      setWishlistItems(data.items || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to load wishlist items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
    if (status === "authenticated") {
      fetchWishlist();
    }
  }, [status, router, toast]);

  

  const removeFromWishlist = async (itemId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from wishlist");
      }

      setWishlistItems((prev) => prev.filter((item) => item._id !== itemId));

      toast({
        title: "Success",
        description: "Item removed from wishlist",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    }
  };

  const addToCart = async (productId: string, variationId: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          variation_id: variationId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      toast({
        title: "Success",
        description: "Item added to cart",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="bg-neutral-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-12 w-1/3 mb-6" />
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row gap-6 border-b pb-8"
                  >
                    <Skeleton className="h-[200px] w-full md:w-1/4 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen py-5 sm:py-8 md:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <UserAccountSidebar activeItem="wishlist" />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-md shadow-sm">
              <h1 className="text-xl sm:text-2xl font-light mb-4 sm:mb-6">
                My Wish List
              </h1>

              {wishlistItems.length === 0 ? (
                <div className="text-center py-10 px-4 border rounded-md">
                  <p className="text-lg mb-6">Your wishlist is empty</p>
                  <Link href="/products">
                    <Button className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {wishlistItems.map((item) => {
                    const price =
                      item.variation.salePrice || item.variation.price;
                    const formattedPrice = new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(price);

                    return (
                      <div
                        key={item._id}
                        className="flex flex-col md:flex-row gap-4  border-b "
                      >
                        {/* Product Image */}
                        <div className="w-60 ">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="block relative aspect-[3/4] rounded-md overflow-hidden"
                          >
                            <Image
                              src={item.variation.image || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </Link>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col  justify-between ">
                          <div>
                            <div className="flex flex-row  sm:flex-row sm:justify-between items-start sm:items-center gap-8">
                              <Link
                                href={`/products/${item.product.slug}`}
                                className="text-xl sm:text-2xl font-medium text-teal-700"
                              >
                                {item.product.name}
                              </Link>
                              <button
                                onClick={() => removeFromWishlist(item._id)}
                                className="self-start sm:self-auto text-gray-700 hover:bg-teal-600 p-2 rounded-full hover:text-white transition-colors duration-200"
                                aria-label="Remove from wishlist"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>

                            <p className="mt-2 text-sm sm:text-base text-gray-700">
                              Size: {item.variation.size}, Color:{" "}
                              {item.variation.color}
                            </p>
                            <p className="mt-1 font-medium text-base sm:text-lg ml-1">
                              {formattedPrice}
                            </p>
                          </div>

                          <div className=" mb-60">
                            <Button
                              className="w-full sm:w-auto border bg-amber-700 hover:bg-teal-700 text-white"
                              onClick={() =>
                                addToCart(item.product._id, item.variation._id)
                              }
                            >
                              Add To Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
