"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const SwiperComponent = () => {
  // const swiperRef = useRef(null);

  const images = [
    "/Banners/art2.png",
    "/Banners/art2.png",
    "/Banners/art2.png",  
    "/Banners/art2.png",
    "/Banners/art2.png",
    "/Banners/art2.png",
    "/Banners/art2.png",
    "/Banners/art2.png",
    "/Banners/art2.png",
  ];

  return (
    <div className="relative mt-3 mb-3  h-64">
      {/* Swiper */}
      <Swiper
        spaceBetween={20}
            slidesPerView={1}
            navigation={{
              nextEl: ".custom-next",
              prevEl: ".custom-prev",
            }}
            modules={[Navigation]}
            breakpoints={{
              640: { slidesPerView: 1 },
              1024: { slidesPerView: 1 },
            }}
            className="w-full rounded-xl"
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}  >
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full h-64 object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

     <button className="custom-prev absolute top-1/2 left-3 -translate-y-1/2 bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 z-10">
            <FaChevronLeft className="text-gray-500 text-sm" />
          </button>

          {/* Next Button */}
          <button className="custom-next absolute top-1/2 right-3 -translate-y-1/2 bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 z-10">
            <FaChevronRight className="text-gray-500 text-sm" />
          </button>
    </div>
  );
};

export default SwiperComponent;
