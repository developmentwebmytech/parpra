"use client";

import { useState, useEffect } from "react";
import {  X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";
import { getProducts, getCategories, getBrands } from "@/lib/api";
import type { Category, Brand, ProductListResponse } from "@/types";
import { Metadata } from "next";


export default function ProductsPage() {
  // State for products and filters
  const [productsData, setProductsData] = useState<ProductListResponse | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes] = useState<string[]>(["XS", "S", "M", "L", "XL", "XXL"]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState("featured");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoriesData = await getCategories();
        setCategories(categoriesData?.categories || []);

        // Fetch brands
        const brandsData: any = await getBrands();
        
         setBrands(brandsData?.brands  || []);
       
        // Extract unique materials and colors from products
        const productsResponse = await getProducts({ limit: 100 });

        const uniqueMaterials = new Set<string>();
        const uniqueColors = new Set<string>();

        if (productsResponse && productsResponse.products) {
          productsResponse.products.forEach((product) => {
            if (product.material) {
              uniqueMaterials.add(product.material);
            }

            if (product.variations) {
              product.variations.forEach((variation) => {
                if (variation.color) {
                  uniqueColors.add(variation.color);
                }
              });
            }
          });
        }

        setMaterials(Array.from(uniqueMaterials));
        setColors(Array.from(uniqueColors));
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params: Record<string, string | number | boolean> = {
          page: currentPage,
          limit: 12,
        };

        if (searchQuery) params.search = searchQuery;
        if (selectedCategories.length > 0)
          params.categoryId = selectedCategories.join(",");
        if (selectedBrands.length > 0)
          params.brandId = selectedBrands.join(",");

        // Sort options
        switch (sortBy) {
          case "featured":
            params.featured = true;
            break;
          case "bestseller":
            params.bestSeller = true;
            break;
          case "newest":
            params.sortBy = "createdAt";
            params.sortOrder = "desc";
            break;
          case "price-low-high":
            params.sortBy = "variations.price";
            params.sortOrder = "asc";
            break;
          case "price-high-low":
            params.sortBy = "variations.price";
            params.sortOrder = "desc";
            break;
        }

        // Price range
        if (priceRange[0] > 0) params.minPrice = priceRange[0];
        if (priceRange[1] < 100000) params.maxPrice = priceRange[1];

        const response = await getProducts(params);
        setProductsData(response);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Update active filters
    const newActiveFilters: string[] = [];

    if (selectedCategories.length > 0) {
      selectedCategories.forEach((catId) => {
        const category = categories.find((c) => c._id === catId);
        if (category) newActiveFilters.push(`Category: ${category.name}`);
      });
    }

    if (selectedBrands.length > 0) {
      selectedBrands.forEach((brandId) => {
        const brand = brands.find((b) => b._id === brandId);
        if (brand) newActiveFilters.push(`Brand: ${brand.name}`);
      });
    }

    if (selectedMaterials.length > 0) {
      selectedMaterials.forEach((material) => {
        newActiveFilters.push(`Material: ${material}`);
      });
    }

    if (selectedColors.length > 0) {
      selectedColors.forEach((color) => {
        newActiveFilters.push(`Color: ${color}`);
      });
    }

    if (selectedSizes.length > 0) {
      selectedSizes.forEach((size) => {
        newActiveFilters.push(`Size: ${size}`);
      });
    }

    if (priceRange[0] > 0 || priceRange[1] < 100000) {
      newActiveFilters.push(`Price: ₹${priceRange[0]} - ₹${priceRange[1]}`);
    }

    setActiveFilters(newActiveFilters);
  }, [
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedMaterials,
    selectedColors,
    selectedSizes,
    priceRange,
    sortBy,
    currentPage,
    categories,
    brands,
  ]);

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle brand selection
  const toggleBrand = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Toggle material selection
  const toggleMaterial = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  // Toggle color selection
  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  // Toggle size selection
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 100000]);
    setCurrentPage(1);
  };

  // Remove a specific filter
  const removeFilter = (filter: string) => {
    const [type, value] = filter.split(": ");

    switch (type) {
      case "Category":
        const categoryId = categories.find((c) => c.name === value)?._id;
        if (categoryId) {
          setSelectedCategories((prev) =>
            prev.filter((id) => id !== categoryId)
          );
        }
        break;
      case "Brand":
        const brandId = brands.find((b) => b.name === value)?._id;
        if (brandId) {
          setSelectedBrands((prev) => prev.filter((id) => id !== brandId));
        }
        break;
      case "Material":
        setSelectedMaterials((prev) => prev.filter((m) => m !== value));
        break;
      case "Color":
        setSelectedColors((prev) => prev.filter((c) => c !== value));
        break;
      case "Size":
        setSelectedSizes((prev) => prev.filter((s) => s !== value));
        break;
      case "Price":
        setPriceRange([0, 100000]);
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8  mb-16">
      <h1 className="text-3xl font-bold mb-8">Products </h1>

      {/* Search and Sort Bar */}
        {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] sm:w-[350px] overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <MobileFilters
                    categories={categories || []}
                    brands={brands || []}
                    materials={materials || []}
                    colors={colors || []}
                    sizes={sizes || []}
                    selectedCategories={selectedCategories}
                    selectedBrands={selectedBrands}
                    selectedMaterials={selectedMaterials}
                    selectedColors={selectedColors}
                    selectedSizes={selectedSizes}
                    priceRange={priceRange}
                    toggleCategory={toggleCategory}
                    toggleBrand={toggleBrand}
                    toggleMaterial={toggleMaterial}
                    toggleColor={toggleColor}
                    toggleSize={toggleSize}
                    setPriceRange={setPriceRange}
                    clearAllFilters={clearAllFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex-1 md:flex-none">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="bestseller">Best Seller</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low-high">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price-high-low">
                    Price: High to Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div> */}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Active Filters:</span>
            {activeFilters.map((filter, index) => (
              <Badge
                key={index}
                variant="outline"
                className="flex items-center gap-1"
              >
                {filter}
                <button onClick={() => removeFilter(filter)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-sm"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filters */}
        <div className="hidden md:block w-64 shrink-0">
          <DesktopFilters
            categories={categories || []}
            brands={brands || []}
            materials={materials || []}
            colors={colors || []}
            sizes={sizes || []}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            selectedMaterials={selectedMaterials}
            selectedColors={selectedColors}
            selectedSizes={selectedSizes}
            priceRange={priceRange}
            toggleCategory={toggleCategory}
            toggleBrand={toggleBrand}
            toggleMaterial={toggleMaterial}
            toggleColor={toggleColor}
            toggleSize={toggleSize}
            setPriceRange={setPriceRange}
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border rounded-md p-4">
                  <div className="aspect-[3/4] bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : productsData?.products?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or search query
              </p>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsData?.products?.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {productsData && productsData.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    {[...Array(productsData.totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                        className={
                          currentPage === i + 1
                            ? "bg-teal-700 hover:bg-teal-800"
                            : ""
                        }
                      >
                        {i + 1}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, productsData.totalPages)
                        )
                      }
                      disabled={currentPage === productsData.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Desktop Filters Component
function DesktopFilters({
  categories = [],
  brands = [],
  materials = [],
  colors = [],
  sizes = [],
  selectedCategories = [],
  selectedBrands = [],
  selectedMaterials = [],
  selectedColors = [],
  selectedSizes = [],
  priceRange = [0, 100000],
  toggleCategory = () => {},
  toggleBrand = () => {},
  toggleMaterial = () => {},
  toggleColor = () => {},
  toggleSize = () => {},
  setPriceRange = () => {},
}: {
  categories: Category[];
  brands: Brand[];
  materials: string[];
  colors: string[];
  sizes: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  selectedMaterials: string[];
  selectedColors: string[];
  selectedSizes: string[];
  priceRange: [number, number];
  toggleCategory: (id: string) => void;
  toggleBrand: (id: string) => void;
  toggleMaterial: (material: string) => void;
  toggleColor: (color: string) => void;
  toggleSize: (size: string) => void;
  setPriceRange: (range: [number, number]) => void;
}) {
  return (
    <div className="space-y-6 ">
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="px-2 ">
          <Slider
            defaultValue={priceRange}
            min={0}
            max={100000}
            step={1000}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-6 text-teal-500"
          />
          <div className="flex items-center justify-between">
            <span>₹{priceRange[0].toLocaleString("en-US")}</span>
            <span>₹{priceRange[1].toLocaleString("en-US")}</span>
          </div>
        </div>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["categories", "brands", "materials", "colors", "sizes"]}
        className="w-full"
      >
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories && categories.length > 0 ? (
                categories.map((category) => {
                  return (
                    <div
                      key={category._id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`category-${category._id}`}
                        checked={selectedCategories.includes(category._id)}
                        onCheckedChange={() => toggleCategory(category._id)}
                      />
                      <label
                        htmlFor={`category-${category._id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500">
                  No categories available
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brands">
          <AccordionTrigger>Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">           
              {brands && brands.length > 0 ? (
                brands.map((brand) => {
                  return (
                    <div
                      key={brand._id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`brand-${brand._id}`}
                        checked={selectedBrands.includes(brand._id)}
                        onCheckedChange={() => toggleBrand(brand._id)}
                      />
                      <label
                        htmlFor={`brand-${brand._id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {brand.name}
                      </label>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500">No brands available</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="materials">
          <AccordionTrigger>Materials</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {materials && materials.length > 0 ? (
                materials.map((material) => (
                  <div key={material} className="flex items-center space-x-2">
                    <Checkbox
                      id={`material-${material}`}
                      checked={selectedMaterials.includes(material)}
                      onCheckedChange={() => toggleMaterial(material)}
                    />
                    <label
                      htmlFor={`material-${material}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {material}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  No materials available
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colors">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {colors && colors.length > 0 ? (
                colors.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={selectedColors.includes(color)}
                      onCheckedChange={() => toggleColor(color)}
                    />
                    <label
                      htmlFor={`color-${color}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {color}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No colors available</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sizes">
          <AccordionTrigger>Sizes</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 S">
              {sizes && sizes.length > 0 ? (
                sizes.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={() => toggleSize(size)}
                    />
                    <label
                      htmlFor={`size-${size}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {size}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No sizes available</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// Mobile Filters Component
function MobileFilters({
  categories,
  brands,
  materials,
  colors,
  sizes,
  selectedCategories,
  selectedBrands,
  selectedMaterials,
  selectedColors,
  selectedSizes,
  priceRange,
  toggleCategory,
  toggleBrand,
  toggleMaterial,
  toggleColor,
  toggleSize,
  setPriceRange,
  clearAllFilters,
}: {
  categories: Category[];
  brands: Brand[];
  materials: string[];
  colors: string[];
  sizes: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  selectedMaterials: string[];
  selectedColors: string[];
  selectedSizes: string[];
  priceRange: [number, number];
  toggleCategory: (id: string) => void;
  toggleBrand: (id: string) => void;
  toggleMaterial: (material: string) => void;
  toggleColor: (color: string) => void;
  toggleSize: (size: string) => void;
  setPriceRange: (range: [number, number]) => void;
  clearAllFilters: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="px-2">
          <Slider
            defaultValue={priceRange}
            min={0}
            max={100000}
            step={1000}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-6"
          />
          <div className="flex items-center justify-between">
            <span>₹{priceRange[0].toLocaleString("en-US")}</span>
            <span>₹{priceRange[1].toLocaleString("en-US")}</span>
          </div>
        </div>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["categories"]}
        className="w-full"
      >
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`mobile-category-${category._id}`}
                      checked={selectedCategories.includes(category._id)}
                      onCheckedChange={() => toggleCategory(category._id)}
                    />
                    <label
                      htmlFor={`mobile-category-${category._id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  No categories available
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brands">
          <AccordionTrigger>Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {brands && brands.length > 0 ? (
                brands.map((brand) => (
                  <div key={brand._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mobile-brand-${brand._id}`}
                      checked={selectedBrands.includes(brand._id)}
                      onCheckedChange={() => toggleBrand(brand._id)}
                    />
                    <label
                      htmlFor={`mobile-brand-${brand._id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {brand.name}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No brands available</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="materials">
          <AccordionTrigger>Materials</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {materials && materials.length > 0 ? (
                materials.map((material) => (
                  <div key={material} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mobile-material-${material}`}
                      checked={selectedMaterials.includes(material)}
                      onCheckedChange={() => toggleMaterial(material)}
                    />
                    <label
                      htmlFor={`mobile-material-${material}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {material}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  No materials available
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colors">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {colors && colors.length > 0 ? (
                colors.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mobile-color-${color}`}
                      checked={selectedColors.includes(color)}
                      onCheckedChange={() => toggleColor(color)}
                    />
                    <label
                      htmlFor={`mobile-color-${color}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {color}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No colors available</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sizes">
          <AccordionTrigger>Sizes</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {sizes && sizes.length > 0 ? (
                sizes.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mobile-size-${size}`}
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={() => toggleSize(size)}
                    />
                    <label
                      htmlFor={`mobile-size-${size}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {size}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No sizes available</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
