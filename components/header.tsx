"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, Heart, User, MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProfileDropdown from "@/components/profile-dropdown";
import CartModal from "@/app/cart/CartModal";
import type { MegaMenuContent, CategoryWithSubcategories } from "@/types";
import { getCategoryTree, getUserWishlist } from "@/lib/api";
import { useSession } from "next-auth/react";
import AnnouncementBar from "./announcement-bar";
import { useToast } from "@/hooks/use-toast";
import logo from "@/public/Logo/Parpra.png";
import AuthPopup from "./auth-popup";

// Update the Header component to fetch categories from the database
export default function Header() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { toast } = useToast();
  // we have to take role from session
  const userRole = session?.user?.role;

  // Fetch cart item count
  useEffect(() => {
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

    // fetchCartCount();

    // Setup an interval to refresh the cart count every minute
     // Setup an interval to refresh the cart count every minute
    // const intervalId = setInterval(fetchCartCount, 60000);
    const intervalId = setInterval(fetchCartCount, 1000);

    // Clean up on component unmount
    return () => clearInterval(intervalId);
  }, [status]);

  // Fetch wishlist count
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (status !== "authenticated") {
        setWishlistCount(0);
        return;
      }

      try {
        const wishlistData = await getUserWishlist();
        // Make sure we're getting the correct count
        setWishlistCount(
          wishlistData.totalItems || wishlistData.items?.length || 0
        );
      } catch (error) {
        console.error("Error fetching wishlist count:", error);
        setWishlistCount(0);
      }
    };

    // fetchWishlistCount();

    // Setup an interval to refresh the wishlist count every minute
    // const intervalId = setInterval(fetchWishlistCount, 60000);

    const intervalId = setInterval(fetchWishlistCount, 1000);

    // Clean up on component unmount
    return () => clearInterval(intervalId);
  }, [status]);

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categoryTree = await getCategoryTree();
        if (categoryTree && categoryTree.length > 0) {
          setCategories(categoryTree);

          // Also update mega menu content based on categories
          const newMegaMenuContent: Record<string, MegaMenuContent> = {};

          categoryTree.forEach((category) => {
            if (category.subcategories && category.subcategories.length > 0) {
              const sections = [
                {
                  title: category.name.toUpperCase(),
                  items: category.subcategories.map((sub) => ({
                    title: sub.name,
                    url: `/${category.name.toLowerCase()}/${sub.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`,
                  })),
                },
              ];

              newMegaMenuContent[category.name.toLowerCase()] = {
                sections,
                featuredImage:
                  category.image ||
                  `/placeholder.svg?height=400&width=300&query=${category.name}`,
              };
            }
          });
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }

      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(query)}&limit=5`
      );
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // View all search results
  const viewAllSearchResults = () => {
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    setShowSearchResults(false);
    setIsSearchOpen(true);
    toast({
      title: "Searching products",
      description: `Showing results for "${searchQuery}"`,
    });
  };

  // Toggle mega menu visibility
  const handleMenuMouseEnter = (menu: string) => {
    // Small delay to prevent accidental triggers
    setTimeout(() => {
      setActiveMenu(menu);
    }, 50);
  };

  // Add this function to handle mouse leave
  const handleMenuMouseLeave = () => {
    setActiveMenu(null);
  };

  // Check if a nav item is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.includes(path);
  };

  const handleOpenLoginPopup = () => {
    if (status === "unauthenticated") {
      setShowLoginPopup(true);
    } else {
      setIsProfileOpen(!isProfileOpen);
    }
  };

  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };

  const gotowishlist = () => {
    if (status === "authenticated") {
      router.push("/wishlist");
    } else {
      setShowLoginPopup(true);
    }
  };

  if (userRole === "admin") return null;

  return (
    // bg-background
    <header className="sticky top-0 z-40 bg-background w-full">
      {/* Announcement Bar */}
      <div>
        <AnnouncementBar />
      </div>
      {/* Auth Popup */}
      {showLoginPopup && <AuthPopup onClose={handleCloseLoginPopup} />}

      {/* Main Header */}
      <div className="border-b">
        <div className="container m-auto ">
          <div className="flex items-center justify-between relative">
            {/* Mobile Menu - Left */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <MenuIcon className="h-10 w-10" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[300px] overflow-y-auto py-6"
                >
                  <div className="flex flex-col h-full space-y-4 ">
                    <div className="py-6 border-b mb-3 ">
                      <Link
                        href="/"
                        className="flex items-center justify-center"
                      >
                        <Image
                          src={logo || "/placeholder.svg"}
                          alt="PARPRA"
                          width={100}
                          height={60}
                        />
                      </Link>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="py-4 px-2">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full"
                      />
                      {showSearchResults && searchResults.length > 0 && (
                        <div className="mt-3">
                          <ul className="space-y-2 max-h-60 overflow-y-auto">
                            {searchResults.map((product) => (
                              <li key={product._id}>
                                <Link
                                  href={`/products/${product.slug}`}
                                  className="flex items-center p-2 hover:bg-gray-50 rounded"
                                  onClick={() => {
                                    setShowSearchResults(false);
                                    toast({
                                      title: "Product selected",
                                      description: `Viewing ${product.name}`,
                                    });
                                  }}
                                >
                                  <div className="relative w-10 h-10 mr-3">
                                    <Image
                                      src={
                                        product.variations[0]?.image ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                      alt={product.name}
                                      fill
                                      className="object-cover rounded"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium truncate">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      ₹
                                      {product.variations[0]?.salePrice ||
                                        product.variations[0]?.price}
                                    </p>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <Button
                            variant="outline"
                            className="w-full mt-3"
                            onClick={viewAllSearchResults}
                          >
                            View all results
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Mobile Navigation Links */}
                    <nav className="flex flex-col py-4 space-y-1">
                      <Link
                        href="/"
                        className={`px-2 py-3 ${
                          pathname === "/"
                            ? "text-teal-800 font-medium"
                            : "text-gray-700"
                        } hover:text-teal-800 border-b`}
                      >
                        Home
                      </Link>
                      {isLoading ? (
                        <div className="px-2 py-3 border-b">
                          <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                      ) : (
                        categories
                          .filter((cat) => !cat.parent_category_id)
                          .map((category) => (
                            <div key={category._id} className="collapsible">
                              <Link
                                href={`/${category.name
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")}`}
                                className={`px-2 py-3 flex justify-between items-center ${
                                  isActive(
                                    `/${category.name
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")}`
                                  )
                                    ? "text-teal-800 font-medium"
                                    : "text-gray-700"
                                } hover:text-teal-800 border-b`}
                              >
                                {category.name}
                              </Link>
                              {category.subcategories?.length > 0 && (
                                <div className="pl-4">
                                  {category.subcategories.map((sub) => (
                                    <Link
                                      key={sub._id}
                                      href={`/${category.name
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")}/${sub.name
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")}`}
                                      className={`px-2 py-2 block ${
                                        isActive(
                                          `/${category.name
                                            .toLowerCase()
                                            .replace(/\s+/g, "-")}/${sub.name
                                            .toLowerCase()
                                            .replace(/\s+/g, "-")}`
                                        )
                                          ? "text-teal-800 font-medium"
                                          : "text-gray-700"
                                      } hover:text-teal-800`}
                                    >
                                      {sub.name}
                                      {sub.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {sub.description}
                                        </p>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                      )}
                      <Link
                        href="/bridal"
                        className={`px-2 py-3 ${
                          isActive("/bridal")
                            ? "text-teal-800 font-medium"
                            : "text-gray-700"
                        } hover:text-teal-800 border-b`}
                      >
                        Bridal
                      </Link>
                      <Link
                        href="/collections"
                        className={`px-2 py-3 ${
                          isActive("/collections")
                            ? "text-teal-800 font-medium"
                            : "text-gray-700"
                        } hover:text-teal-800 border-b`}
                      >
                        Collections
                      </Link>
                      <Link
                        href="/contact"
                        className={`px-2 py-3 ${
                          isActive("/contact")
                            ? "text-teal-800 font-medium"
                            : "text-gray-700"
                        } hover:text-teal-800 border-b`}
                      >
                        Contact
                      </Link>
                    </nav>

                    {/* Wishlist and Cart in Mobile */}
                    <div className="flex items-center mt-6 mb-4 px-2 gap-4">
                      <div
                        className="relative cursor-pointer"
                        onClick={gotowishlist}
                      >
                        <Heart className="h-5 w-5 text-gray-700 hover:text-red-500" />
                        {wishlistCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {wishlistCount}
                          </span>
                        )}
                        <span className="ml-2">Wishlist</span>
                      </div>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setIsCartOpen(true)}
                      >
                        <ShoppingBag className="h-5 w-5 text-gray-700" />
                        {cartItemCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-teal-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {cartItemCount}
                          </span>
                        )}
                        <span className="ml-2">Cart</span>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo - Centered on mobile, left-aligned on desktop */}
            <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:left-0 md:flex md:items-center ml-5">
              <Link href="/" className="flex items-center">
                <Image
                  src={logo || "/placeholder.svg"}
                  alt="PARPRA"
                  width={100}
                  height={60}
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div
              className="hidden md:flex md:flex-1 md:justify-center overflow-x-auto relative"
              ref={navRef}
            >
              <nav className="flex items-center space-x-8 py-3 whitespace-nowrap">
                {isLoading ? (
                  <>
                    <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                  </>
                ) : (
                  categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/${category.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className={`text-sm hover:text-teal-800 ${
                        isActive(
                          `/${category.name.toLowerCase().replace(/\s+/g, "-")}`
                        )
                          ? "text-teal-800 font-medium"
                          : ""
                      }`}
                      onMouseEnter={() =>
                        handleMenuMouseEnter(category.name.toLowerCase())
                      }
                      onClick={()=>{setIsSearchOpen(false)}}
                    >
                      {category.name.toUpperCase()}
                    </Link>
                  ))
                )}
                <Link
                  href="/products"
                  className={`text-sm hover:text-teal-800 ${
                    isActive("/collections") ? "text-teal-800 font-medium" : ""
                  }`}
                  onMouseEnter={() => setActiveMenu(null)}
                >
                  COLLECTION
                </Link>
              </nav>
            </div>

            {/* Actions - Right aligned on both mobile and desktop */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block" ref={searchRef}>
                <button
                  className="flex items-center hover:text-teal-800"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="Search"
                >
                  <Search className="h-6 w-6" />
                </button>
              </div>

              <div className="relative hidden md:block">
                <Heart
                  className="h-6 w-6 hover:text-red-500 cursor-pointer"
                  onClick={gotowishlist}
                  aria-label="Wishlist"
                />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center hover:text-teal-800"
                  onClick={handleOpenLoginPopup}
                  aria-label="User Account"
                >
                  <User className="h-6 w-6" />
                </button>
                {isProfileOpen && status === "authenticated" && (
                  <ProfileDropdown />
                )}
              </div>

              <button
                className="flex items-center hover:text-teal-800 relative"
                onClick={() => setIsCartOpen(true)}
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-teal-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="py-4 border-t mt-4 cursor-pointer" ref={searchRef}>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-10 w-full"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                />
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {showSearchResults && searchResults.length > 0 && (
                <div className="mt-3">
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((product: any) => (
                      <li key={product._id}>
                        <Link
                          href={`/products/${product.slug}`} // ✅ dynamic product detail route
                          className="flex items-center  p-2 hover:bg-gray-50 rounded"
                          onClick={() => {
                            setShowSearchResults(false);
                            setIsSearchOpen(false);
                            console.log("link clicked")

                            toast({
                              title: "Product selected",
                              description: `Viewing ${product.name}`,
                            });
                          }}
                        >
                          <div className="relative w-10 h-10 mr-3 ">
                            <Image
                              src={product.variations[0]?.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 ">
                            <p className="text-sm font-medium truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₹
                              {product.variations[0]?.salePrice ||
                                product.variations[0]?.price}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={viewAllSearchResults}
                  >
                    View all results
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
