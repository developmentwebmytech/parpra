"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ban1 from "@/public/mobbanner/mob.png"


interface BannerSection {
  _id: string;
  name: string;
  type: string;
  title?: string;
  subtitle?: string;
  image?: string;
  isActive: boolean;
  position: number;
  config?: {
    buttonText?: string;
    buttonLink?: string;
    backgroundColor?: string;
    textColor?: string;
    alignment?: "left" | "center" | "right";
  };
}



interface HeroBannerSliderProps {
  bannerSections: BannerSection[];
}

export default function HeroBannerSlider({
  bannerSections,
}: HeroBannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to go to the next slide
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === bannerSections.length - 1 ? 0 : prevIndex + 1
    );
  }, [bannerSections.length]);

  // Function to go to the previous slide
  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? bannerSections.length - 1 : prevIndex - 1
    );
  }, [bannerSections.length]);

  // Auto-slide effect
  useEffect(() => {
    if (bannerSections.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [bannerSections.length, nextSlide]);

  // If no banners, show a default banner
  if (!bannerSections || bannerSections.length === 0) {
    return (
      <section className="relative h-[70vh] md:h-[80vh] w-full">
        <Image
          src="/diverse-products-still-life.png"
          alt="Parpra - Ethnic Wear Collection"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center p-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Discover Timeless Elegance
            </h1>
            <p className="text-lg md:text-xl text-white mb-6">
              Explore our curated collection of premium ethnic wear
            </p>
            <Link
              href="/products"
              className="inline-block bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[300px] overflow-hidden">
      {/* Banner Images */}
      {bannerSections.map((banner, index) => {
        // Get config values with defaults
        // const buttonText = banner.config?.buttonText || "Shop Now"
        // const buttonLink = banner.config?.buttonLink || "/products"
        // const alignment = banner.config?.alignment || "center"
        // const textColor = banner.config?.textColor || "white"

        // Determine text alignment class
        // const alignmentClass =
        //   alignment === "left"
        //     ? "justify-start text-left"
        //     : alignment === "right"
        //       ? "justify-end text-right"
        //       : "justify-center text-center"

        return (
          <Link href="" key={banner._id}>
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Desktop Image (shown on sm and up) */}
              <div className="hidden sm:block absolute inset-0">
                <Image
                  src={banner.image || "/diverse-products-still-life.png"}
                  alt={banner.title || "Banner Desktop"}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center p-4 md:p-8" />
              </div>

              {/* Mobile Image (shown below sm) */}
              <div className="block sm:hidden absolute inset-0">
                <Image
                  src={ban1 || "/mobile-banner-placeholder.png"}
                  alt={banner.title || "Banner Mobile"}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center p-4 md:p-8" />
              </div>
            </div>
          </Link>
        );
      })}

      {/* Navigation Arrows - Only show if there are multiple banners */}
      {bannerSections.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </section>
  );
}
