"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

// Dummy data (API se bhi aa sakti hai)
const categories = [
  { _id: "c1", name: "Electronics" },
  { _id: "c2", name: "Fashion" },
];
const brands = [
  { _id: "b1", name: "Nike" },
  { _id: "b2", name: "Adidas" },
];
const materials = ["Cotton", "Leather", "Polyester"];
const colors = ["Red", "Blue", "Green"];
const sizes = ["S", "M", "L", "XL"];

export default function FilterSidebar() {
  // Price range state
  const [priceRange, setPriceRange] = useState([0, 50000]);

  // Filters states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Toggle functions
  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const toggleColor = (col: string) => {
    setSelectedColors((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  return (
    <div className="p-4 border rounded-lg w-72 space-y-6">
      {/* Price Range */}
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
            className="mb-6 text-teal-500"
          />
          <div className="flex items-center justify-between">
            <span>₹{priceRange[0].toLocaleString("en-US")}</span>
            <span>₹{priceRange[1].toLocaleString("en-US")}</span>
          </div>
        </div>
      </div>

      {/* Accordion Filters */}
      <Accordion
        type="multiple"
        defaultValue={["categories", "brands", "materials", "colors", "sizes"]}
        className="w-full"
      >
        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.length > 0 ? (
                categories.map((category) => (
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
                      className="text-sm font-medium leading-none"
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

        {/* Brands */}
        <AccordionItem value="brands">
          <AccordionTrigger>Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {brands.length > 0 ? (
                brands.map((brand) => (
                  <div key={brand._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand._id}`}
                      checked={selectedBrands.includes(brand._id)}
                      onCheckedChange={() => toggleBrand(brand._id)}
                    />
                    <label
                      htmlFor={`brand-${brand._id}`}
                      className="text-sm font-medium leading-none"
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

        {/* Materials */}
        <AccordionItem value="materials">
          <AccordionTrigger>Materials</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {materials.length > 0 ? (
                materials.map((material) => (
                  <div key={material} className="flex items-center space-x-2">
                    <Checkbox
                      id={`material-${material}`}
                      checked={selectedMaterials.includes(material)}
                      onCheckedChange={() => toggleMaterial(material)}
                    />
                    <label
                      htmlFor={`material-${material}`}
                      className="text-sm font-medium leading-none"
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

        {/* Colors */}
        <AccordionItem value="colors">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {colors.length > 0 ? (
                colors.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={selectedColors.includes(color)}
                      onCheckedChange={() => toggleColor(color)}
                    />
                    <label
                      htmlFor={`color-${color}`}
                      className="text-sm font-medium leading-none"
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

        {/* Sizes */}
        <AccordionItem value="sizes">
          <AccordionTrigger>Sizes</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {sizes.length > 0 ? (
                sizes.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={() => toggleSize(size)}
                    />
                    <label
                      htmlFor={`size-${size}`}
                      className="text-sm font-medium leading-none"
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
