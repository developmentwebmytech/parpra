"use client";

import type React from "react";

import { useState, useEffect } from "react";
import AuthPopup from "@/components/auth-popup";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import type { Product, Variation } from "@/types";
import { addToCart, addToWishlist } from "@/lib/api";
import ProductReviews from "@/components/product-reviews";
import { getCategoryTree, getUserWishlist } from "@/lib/api";


interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
   const [cartItemCount, setCartItemCount] = useState(0);
   const [wishlistCount, setWishlistCount] = useState(0);

  // Get unique sizes and colors from variations
  const sizes = Array.from(new Set(product.variations.map((v) => v.size)));
  const colors = Array.from(
    new Set(
      product.variations
        .filter((v) => !selectedSize || v.size === selectedSize)
        .map((v) => v.color)
    )
  );

  // Set initial selected variation
  useEffect(() => {
    if (product.variations.length > 0) {
      const firstVariation = product.variations[0];
      setSelectedSize(firstVariation.size);
      setSelectedColor(firstVariation.color);
      setSelectedVariation(firstVariation);
    }
  }, [product]);

  // Update selected variation when size or color changes
  useEffect(() => {
    const variation = product.variations.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
    setSelectedVariation(variation || null);
  }, [selectedSize, selectedColor, product.variations]);

  // Fix image paths if needed
  const fixImagePath = (path: string) => {
    if (!path) return "/diverse-products-still-life.png";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `/${path}`;
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);

    // Find a variation with the selected size and any color
    const variation = product.variations.find((v) => v.size === size);
    if (variation) {
      setSelectedColor(variation.color);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(Number.parseInt(e.target.value));
  };

  const handleAddToCart = async () => {
    if (!selectedVariation) {
      toast({
        title: "Error",
        description: "Please select a size and color",
        variant: "destructive",
      });
      return;
    }

    if (status !== "authenticated") {
      setShowPopup(true);
      return;
    }

    setAddingToCart(true);

    try {
      await addToCart(product._id, selectedVariation._id, quantity);

      toast({
        title: "Success",
        description: "Product added to cart",
      });

      //fetch product cart count 
      const fetchCartCount = async () => {
      if (status !== "authenticated") {
        setCartItemCount(0);
        return;
      }

      try {
        const response = await fetch("/api/cart");
        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = await response.json();
        // Calculate total quantity considering item quantities
        const count =
          data.items?.reduce(
            (total: number, item: any) => total + item.quantity,
            0
          ) || 0;
        setCartItemCount(count);
      } catch (error) {
        console.error("Error fetching cart count:", error);
        setCartItemCount(0);
      }
    };

    fetchCartCount()

    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!selectedVariation) {
      toast({
        title: "Error",
        description: "Please select a size and color",
        variant: "destructive",
      });
      return;
    }

    if (status !== "authenticated") {
      setShowPopup(true);
      return;
    }

    setAddingToWishlist(true);

    
    

    try {
      await addToWishlist(product._id, selectedVariation._id);

      setAddedToWishlist(true);
      toast({
        title: "Success",
        description: "Product added to wishlist",
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add to wishlist",
        variant: "destructive",
      });
    } finally {
      setAddingToWishlist(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-14">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Images */}
        <div className="w-full md:w-1/2">
          {/* Main Image */}
          <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg">
            {selectedVariation && (
              <Image
                src={
                  fixImagePath(selectedVariation.image) || "/placeholder.svg"
                }
                alt={product.name}
                fill
                className="object-cover object-center"
                priority
              />
            )}
          </div>
          {showPopup && <AuthPopup onClose={() => setShowPopup(false)} />}

          {/* Gallery Images */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {selectedVariation?.gallery?.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="relative w-full aspect-square overflow-hidden rounded-lg"
              >
                <Image
                  src={fixImagePath(image) || "/placeholder.svg"}
                  alt={`${product.name} - Gallery ${index + 1}`}
                  fill
                  className="object-cover object-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-black">
            {product.name}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-1 sm:gap-4">
            <p className="text-gray-500">Brand: {product.brand_id?.name}</p>
            <p className="text-gray-500">
              Category: {product.category_id?.name}
            </p>
          </div>

          <div className="mb-6">
            {selectedVariation?.salePrice ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xl sm:text-2xl font-bold text-amber-700">
                  ₹{selectedVariation.salePrice.toLocaleString()}
                </p>
                <p className="text-base sm:text-lg text-gray-500 line-through">
                  ₹{selectedVariation.price.toLocaleString()}
                </p>
                <p className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-sm">
                  {Math.round(
                    ((selectedVariation.price - selectedVariation.salePrice) /
                      selectedVariation.price) *
                      100
                  )}
                  % OFF
                </p>
              </div>
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-amber-700">
                ₹{selectedVariation?.price.toLocaleString() || "N/A"}
              </p>
            )}
          </div>

          {/* Size Selection */}
          <div className="mb-4">
            <p className="font-medium mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`px-3 py-1 border rounded-md ${
                    selectedSize === size
                      ? "border-amber-700 bg-amber-50 text-amber-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-4">
            <p className="font-medium mb-2">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`px-3 py-1 border rounded-md ${
                    selectedColor === color
                      ? "border-amber-700 bg-amber-50 text-amber-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleColorChange(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="mb-6">
            <p className="font-medium mb-2">Quantity</p>
            <select
              value={quantity}
              onChange={handleQuantityChange}
              className="border border-gray-300 rounded-md px-4 py-2 w-24"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status */}
          {selectedVariation && (
            <div className="mb-6">
              <p
                className={
                  selectedVariation.quantity > 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {selectedVariation.quantity > 0
                  ? `In Stock (${selectedVariation.quantity} available)`
                  : "Out of Stock"}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              className="flex-1 bg-teal-700 hover:bg-amber-800 p-4 sm:p-6 md:p-8 lg:p-8"
              size="lg"
              onClick={handleAddToCart}
              disabled={
                addingToCart ||
                !selectedVariation ||
                selectedVariation.quantity < 1
              }
            >
              {addingToCart ? (
                "Adding..."
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-amber-700 hover:bg-teal-600  text-white p-4 sm:p-6 md:p-8 lg:p-8"
              size="lg"
              onClick={handleAddToWishlist}
              disabled={addingToWishlist || addedToWishlist}
            >
              {addingToWishlist ? (
                "Adding..."
              ) : addedToWishlist ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Added to Wishlist
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-5 w-5" />
                  Add to Wishlist
                </>
              )}
            </Button>
          </div>

          {/* Product Description */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              Description
            </h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Product Details */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Details</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Material: {product.material}</li>
              <li>SKU: {selectedVariation?.sku || "N/A"}</li>
              {product.tags && product.tags.length > 0 && (
                <li>Tags: {product.tags.join(", ")}</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      <ProductReviews productId={product._id} productSlug={product.slug} />
    </div>
  );
}
