"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import AuthPopup from "./auth-popup";
import { useMemo } from "react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  variations: Array<{
    _id: string;
    price: number;
    salePrice?: number;
    image?: string;
  }>;
}

interface BestSellersProps {
  products?: Product[];
  sectionImage?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export default function BestSellers({
  products = [],
  sectionImage,
  sectionTitle = "Best Sellers",
  sectionSubtitle,
}: BestSellersProps) {
  // Ensure products is always an array
  const safeProducts = useMemo(() => {
  return Array.isArray(products) ? products : [];
}, [products]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const { data: session } = useSession();
  const { toast } = useToast();

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  const handleAuthPopupClose = () => {
    setShowAuthPopup(false);
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [safeProducts]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 400);
    }
  };

  const handleAddToWishlist = async (
    e: React.MouseEvent,
    productId: string,
    variationId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      setShowAuthPopup(true);
      return;
    }

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          variation_id: variationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to wishlist");
      }

      toast({
        title: "Success",
        description: "Added to wishlist",
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-y-4">
          {/* Title & Subtitle */}
          <div className="w-full sm:flex-1">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-1 text-teal-700">
              {sectionTitle}
            </h2>
            {sectionSubtitle && (
              <p className="text-gray-600 text-sm sm:text-base pt-1 text-start ml-1">
                {sectionSubtitle}
              </p>
            )}
          </div>

          {/* Scroll Buttons beside title on large screen */}
          <div className="flex space-x-2 sm:flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="rounded-full bg-teal-900 hover:bg-teal-600 text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="rounded-full bg-teal-900 hover:bg-teal-600 text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Image - Below or side depending on screen */}
        {sectionImage && (
          <div className="w-full md:w-1/3 relative h-40 mb-6 md:mb-0 mx-auto md:mx-0">
            <Image
              src={sectionImage || "/placeholder.svg"}
              alt={sectionTitle}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}

        {showAuthPopup && <AuthPopup onClose={handleAuthPopupClose} />}

        {/* Product Scroll Section */}
        <div
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
        >
          {safeProducts.map((product) => {
            const mainVariation = product.variations[0];
            const price = mainVariation?.price || 0;
            const salePrice = mainVariation?.salePrice;

            const formattedPrice = new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(price);

            const formattedSalePrice = salePrice
              ? new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(salePrice)
              : null;

            return (
              <div key={product._id} className="min-w-[280px] max-w-[280px]">
                <div className="group relative">
                  <div className="aspect-[3/4] relative overflow-hidden rounded-md">
                    <Image
                      src={
                        mainVariation.image ||
                        "/placeholder.svg?height=600&width=450&query=ethnic wear"
                      }
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 hover:cursor-pointer"
                      onClick={(e) =>
                        handleAddToWishlist(e, product._id, mainVariation._id)
                      }
                    >
                      <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="font-bold text-teal-600">
                          {salePrice ? formattedSalePrice : formattedPrice}
                        </p>
                        {salePrice && (
                          <p className="text-gray-500 line-through text-sm">
                            {formattedPrice}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link
            href="/products?sort=bestseller"
            className="inline-block bg-teal-600 rounded-md px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-md font-semibold text-white shadow-md hover:bg-teal-500 transition-colors"
          >
            VIEW ALL
          </Link>
        </div>
      </div>
    </section>
  );
}
